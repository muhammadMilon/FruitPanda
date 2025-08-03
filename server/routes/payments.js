import express from 'express';
import { body, validationResult } from 'express-validator';
import { Order } from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';
import { generateReceiptPDF, saveReceiptToFile, generateReceiptHTML } from '../utils/receipt.js';

const router = express.Router();

// Submit payment for admin review
router.post('/submit',
  requireAuth,
  [
    body('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('transactionId').optional().trim(),
    body('paymentMethod').isIn(['bkash', 'nagad', 'cod', 'card']).withMessage('Valid payment method is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { orderId, transactionId, paymentMethod, amount } = req.body;

      // Find the order
      const order = await Order.findById(orderId).populate('customerId', 'name email');
      
      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      // Verify the order belongs to the authenticated user
      if (order.customerId._id.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          message: 'You can only submit payments for your own orders'
        });
      }

      // Verify payment amount matches order total
      if (Math.abs(amount - order.pricing.total) > 0.01) {
        return res.status(400).json({
          message: 'Payment amount does not match order total'
        });
      }

      // Update order payment status to pending for admin review
      order.payment.status = 'pending';
      order.payment.method = paymentMethod;
      order.payment.transactionId = transactionId || null;
      order.payment.submittedAt = new Date();

      // Update order status
      order.status = 'pending';
      order.timeline.push({
        status: 'pending',
        message: `Payment submitted via ${paymentMethod.toUpperCase()}. Awaiting admin confirmation.`,
        timestamp: new Date()
      });

      await order.save();

      res.json({
        message: 'Payment submitted successfully. Awaiting admin confirmation.',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.payment.status
        }
      });
    } catch (error) {
      console.error('Payment confirmation error:', error);
      res.status(500).json({
        message: 'Failed to confirm payment',
        error: error.message
      });
    }
  }
);

// Download receipt
router.get('/receipt/:orderNumber',
  requireAuth,
  async (req, res) => {
    try {
      const { orderNumber } = req.params;

      // Find the order
      const order = await Order.findOne({ orderNumber }).populate('customer', 'name email');
      
      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      // Verify the order belongs to the authenticated user
      if (order.customer._id.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          message: 'You can only download receipts for your own orders'
        });
      }

      // Generate receipt PDF
      const paymentDetails = {
        transactionId: order.payment.transactionId || `FP-${Date.now()}`,
        paymentMethod: order.payment.method,
        amount: order.pricing.total,
        confirmedAt: order.payment.paidAt || order.createdAt
      };

      const pdfBuffer = await generateReceiptPDF(order, paymentDetails);

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${orderNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Receipt download error:', error);
      res.status(500).json({
        message: 'Failed to generate receipt',
        error: error.message
      });
    }
  }
);

// Get payment status
router.get('/status/:orderId',
  requireAuth,
  async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findById(orderId).select('payment status orderNumber');
      
      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      // Verify the order belongs to the authenticated user
      if (order.customer.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          message: 'You can only check payment status for your own orders'
        });
      }

      res.json({
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status,
        orderStatus: order.status,
        paymentMethod: order.payment.method,
        paidAt: order.payment.paidAt
      });
    } catch (error) {
      console.error('Payment status check error:', error);
      res.status(500).json({
        message: 'Failed to check payment status',
        error: error.message
      });
    }
  }
);

// Simulate payment for testing (for development only)
router.post('/simulate/:orderId',
  requireAuth,
  async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        message: 'Payment simulation not allowed in production'
      });
    }

    try {
      const { orderId } = req.params;
      const { paymentMethod = 'bkash', transactionId } = req.body;

      const order = await Order.findById(orderId).populate('customer', 'name email');
      
      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      // Verify the order belongs to the authenticated user
      if (order.customer._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'You can only simulate payments for your own orders'
        });
      }

      // Update order payment status
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      order.payment.transactionId = transactionId || `SIM-${Date.now()}`;

      // Update order status
      order.status = 'confirmed';
      order.timeline.push({
        status: 'confirmed',
        message: `Payment simulated via ${paymentMethod.toUpperCase()}`,
        timestamp: new Date()
      });

      await order.save();

      // Generate receipt
      const paymentDetails = {
        transactionId: order.payment.transactionId,
        paymentMethod,
        amount: order.pricing.total,
        confirmedAt: new Date()
      };

      const receiptData = await saveReceiptToFile(order, paymentDetails);

      // Send confirmation email
      try {
        await sendEmail({
          to: order.customerInfo.email,
          template: 'payment-confirmation',
          data: {
            order,
            paymentDetails,
            receiptUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/receipt/${order.orderNumber}`
          }
        });
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
      }

      res.json({
        message: 'Payment simulated successfully',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.payment.status
        },
        receipt: {
          fileName: receiptData.fileName,
          downloadUrl: `/api/payments/receipt/${order.orderNumber}`
        }
      });
    } catch (error) {
      console.error('Payment simulation error:', error);
      res.status(500).json({
        message: 'Failed to simulate payment',
        error: error.message
      });
    }
  }
);

// Admin: Confirm payment and generate receipt
router.post('/admin/confirm/:orderId',
  requireAuth,
  [
    body('transactionId').optional().trim(),
    body('notes').optional().trim()
  ],
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Admin access required'
        });
      }

      const { orderId } = req.params;
      const { transactionId, notes } = req.body;

      // Find the order
      const order = await Order.findById(orderId)
        .populate('customerId', 'name email')
        .populate('items.productId');
      
      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      // Check if payment is pending
      if (order.payment.status !== 'pending') {
        return res.status(400).json({
          message: 'Order payment is not pending confirmation'
        });
      }

      // Update order payment status
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      if (transactionId) {
        order.payment.transactionId = transactionId;
      }
      if (notes) {
        order.payment.adminNotes = notes;
      }

      // Update order status
      order.status = 'confirmed';
      order.timeline.push({
        status: 'confirmed',
        message: `Payment confirmed by admin via ${order.payment.method.toUpperCase()}`,
        timestamp: new Date()
      });

      await order.save();

      // Generate receipt
      const paymentDetails = {
        transactionId: order.payment.transactionId || `FP-${Date.now()}`,
        paymentMethod: order.payment.method,
        amount: order.pricing.total,
        confirmedAt: new Date(),
        confirmedBy: req.user.name || 'Admin'
      };

             try {
         const receiptData = await saveReceiptToFile(order, paymentDetails);
         
         // Create receipt record in database
         const { Receipt } = await import('../models/Receipt.js');
         
         const receipt = new Receipt({
           orderId: order._id,
           orderNumber: order.orderNumber,
           customerId: order.customerId._id,
           customerInfo: {
             name: order.customerId.name,
             email: order.customerId.email,
             phone: order.customerId.phone
           },
           items: order.items.map(item => ({
             productId: item.productId._id,
             productInfo: {
               name: item.productId.name,
               nameBn: item.productId.nameBn,
               image: item.productId.image
             },
             quantity: item.quantity,
             price: item.price,
             subtotal: item.subtotal
           })),
           pricing: order.pricing,
           payment: order.payment,
           shippingAddress: order.shippingAddress,
           pdfPath: receiptData.filePath,
           status: 'generated'
         });

         await receipt.save();

         // Update the receipt with the correct URL after saving
         receipt.pdfUrl = `/api/receipts/download/${receipt._id}`;
         await receipt.save();

        // Send confirmation email
        try {
          await sendEmail({
            to: order.customerId.email,
            template: 'payment-confirmation',
            data: {
              order,
              paymentDetails,
              receiptUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/receipt/${order.orderNumber}`
            }
          });
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
        }

        res.json({
          message: 'Payment confirmed successfully',
          order: {
            id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            payment: order.payment
          },
          receipt: {
            id: receipt._id,
            receiptNumber: receipt.receiptNumber,
            pdfUrl: receipt.pdfUrl
          }
        });
      } catch (receiptError) {
        console.error('Error generating receipt:', receiptError);
        res.status(500).json({
          message: 'Payment confirmed but receipt generation failed',
          order: {
            id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            payment: order.payment
          }
        });
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({
        message: 'Failed to confirm payment'
      });
    }
  }
);

// Admin: Reject payment
router.post('/admin/reject/:orderId',
  requireAuth,
  [
    body('reason').trim().notEmpty().withMessage('Rejection reason is required')
  ],
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          message: 'Admin access required'
        });
      }

      const { orderId } = req.params;
      const { reason } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Find the order
      const order = await Order.findById(orderId).populate('customerId', 'name email');
      
      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      // Check if payment is pending
      if (order.payment.status !== 'pending') {
        return res.status(400).json({
          message: 'Order payment is not pending confirmation'
        });
      }

      // Update order payment status
      order.payment.status = 'failed';
      order.payment.rejectionReason = reason;
      order.payment.rejectedAt = new Date();
      order.payment.rejectedBy = req.user.id;

      // Update order status
      order.status = 'cancelled';
      order.timeline.push({
        status: 'cancelled',
        message: `Payment rejected by admin. Reason: ${reason}`,
        timestamp: new Date()
      });

      await order.save();

      res.json({
        message: 'Payment rejected successfully',
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          payment: order.payment
        }
      });
    } catch (error) {
      console.error('Error rejecting payment:', error);
      res.status(500).json({
        message: 'Failed to reject payment'
      });
    }
  }
);

export default router; 