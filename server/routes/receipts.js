import express from 'express';
import { Receipt } from '../models/Receipt.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { generateReceiptPDF, saveReceiptToFile } from '../utils/receipt.js';
import { requireAuth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all receipts for a user
router.get('/user', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [receipts, total] = await Promise.all([
      Receipt.findByCustomer(req.user.id, parseInt(limit), skip),
      Receipt.countDocuments({ customerId: req.user.id })
    ]);
    
    res.json({
      success: true,
      receipts: receipts.map(receipt => ({
        id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        orderNumber: receipt.orderNumber,
        total: receipt.pricing.total,
        status: receipt.status,
        generatedAt: receipt.generatedAt,
        downloadCount: receipt.metadata.downloadCount,
        pdfUrl: receipt.pdfUrl
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch receipts' 
    });
  }
});

// Get receipt by ID
router.get('/:receiptId', requireAuth, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.receiptId)
      .populate('orderId')
      .populate('customerId', 'name email');
    
    if (!receipt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Receipt not found' 
      });
    }
    
    // Check if user owns this receipt
    if (receipt.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    res.json({
      success: true,
      receipt: {
        id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        orderNumber: receipt.orderNumber,
        customerInfo: receipt.customerInfo,
        items: receipt.items,
        pricing: receipt.pricing,
        payment: receipt.payment,
        shippingAddress: receipt.shippingAddress,
        status: receipt.status,
        generatedAt: receipt.generatedAt,
        pdfUrl: receipt.pdfUrl
      }
    });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch receipt' 
    });
  }
});

// Generate receipt for an order
router.post('/generate/:orderId', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId)
      .populate('customerId', 'name email phone')
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if user owns this order
    if (order.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    // Check if receipt already exists
    const existingReceipt = await Receipt.findOne({ orderId });
    if (existingReceipt) {
      return res.json({
        success: true,
        message: 'Receipt already exists',
        receipt: {
          id: existingReceipt._id,
          receiptNumber: existingReceipt.receiptNumber,
          pdfUrl: existingReceipt.pdfUrl
        }
      });
    }
    
    // Prepare receipt data
    const receiptData = {
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
      shippingAddress: order.shippingAddress
    };
    
    // Create receipt record
    const receipt = new Receipt(receiptData);
    await receipt.save();
    
    // Generate PDF
    const pdfResult = await saveReceiptToFile(order, order.payment);
    
    // Update receipt with PDF info
    receipt.pdfPath = pdfResult.filePath;
    receipt.pdfUrl = `/api/receipts/download/${receipt._id}`;
    await receipt.save();
    
    res.json({
      success: true,
      message: 'Receipt generated successfully',
      receipt: {
        id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        pdfUrl: receipt.pdfUrl
      }
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate receipt' 
    });
  }
});

// Download receipt PDF by receipt ID
router.get('/download/:receiptId', requireAuth, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.receiptId);
    
    if (!receipt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Receipt not found' 
      });
    }
    
    // Check if user owns this receipt
    if (receipt.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    if (!receipt.pdfPath) {
      return res.status(404).json({ 
        success: false, 
        message: 'PDF file not found' 
      });
    }
    
    // Increment download count
    await receipt.incrementDownloadCount();
    
    // Send file
    res.download(receipt.pdfPath, `receipt-${receipt.receiptNumber}.pdf`);
  } catch (error) {
    console.error('Error downloading receipt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download receipt' 
    });
  }
});

// Download receipt PDF by order number
router.get('/download/order/:orderNumber', requireAuth, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    // Find receipt by order number
    const receipt = await Receipt.findOne({ orderNumber });
    
    if (!receipt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Receipt not found for this order' 
      });
    }
    
    // Check if user owns this receipt
    if (receipt.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    if (!receipt.pdfPath) {
      return res.status(404).json({ 
        success: false, 
        message: 'PDF file not found' 
      });
    }
    
    // Increment download count
    await receipt.incrementDownloadCount();
    
    // Send file
    res.download(receipt.pdfPath, `receipt-${receipt.receiptNumber}.pdf`);
  } catch (error) {
    console.error('Error downloading receipt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download receipt' 
    });
  }
});

// Admin: Get all receipts
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    const { page = 1, limit = 20, status, customerId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    
    const receipts = await Receipt.find(query)
      .populate('customerId', 'name email')
      .populate('orderId', 'orderNumber status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Receipt.countDocuments(query);
    
    res.json({
      success: true,
      receipts: receipts.map(receipt => ({
        id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        orderNumber: receipt.orderNumber,
        customerName: receipt.customerId?.name,
        total: receipt.pricing.total,
        status: receipt.status,
        generatedAt: receipt.generatedAt,
        downloadCount: receipt.metadata.downloadCount
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch receipts' 
    });
  }
});

// Admin: Delete receipt
router.delete('/admin/:receiptId', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    
    const receipt = await Receipt.findById(req.params.receiptId);
    
    if (!receipt) {
      return res.status(404).json({ 
        success: false, 
        message: 'Receipt not found' 
      });
    }
    
    await Receipt.findByIdAndDelete(req.params.receiptId);
    
    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete receipt' 
    });
  }
});

// Generate receipts for existing orders (for orders that don't have receipts yet)
router.post('/generate-missing', requireAuth, async (req, res) => {
  try {
    // Find orders that don't have receipts
    const ordersWithoutReceipts = await Order.find({
      customerId: req.user.id,
      'payment.status': 'paid'
    }).populate('customerId', 'name email phone')
      .populate('items.productId');

    const generatedReceipts = [];

    for (const order of ordersWithoutReceipts) {
      // Check if receipt already exists
      const existingReceipt = await Receipt.findOne({ orderId: order._id });
      if (existingReceipt) continue;

      // Generate PDF first
      const paymentDetails = {
        transactionId: order.payment.transactionId || `FP-${Date.now()}`,
        paymentMethod: order.payment.method,
        amount: order.pricing.total,
        confirmedAt: order.payment.paidAt || new Date()
      };

      const pdfResult = await saveReceiptToFile(order, paymentDetails);

      // Create receipt record
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
        pdfPath: pdfResult.filePath,
        status: 'generated'
      });

      await receipt.save();

      // Update receipt with correct URL
      receipt.pdfUrl = `/api/receipts/download/${receipt._id}`;
      await receipt.save();

      generatedReceipts.push({
        id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        orderNumber: receipt.orderNumber
      });
    }

    res.json({
      success: true,
      message: `Generated ${generatedReceipts.length} receipts`,
      receipts: generatedReceipts
    });
  } catch (error) {
    console.error('Error generating missing receipts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate missing receipts' 
    });
  }
});

// Generate receipts for all paid orders (admin only)
router.post('/generate-all-paid', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Find all paid orders that don't have receipts
    const ordersWithoutReceipts = await Order.find({
      'payment.status': 'paid'
    }).populate('customerId', 'name email phone')
      .populate('items.productId');

    const generatedReceipts = [];

    for (const order of ordersWithoutReceipts) {
      // Check if receipt already exists
      const existingReceipt = await Receipt.findOne({ orderId: order._id });
      if (existingReceipt) continue;

      // Generate PDF first
      const paymentDetails = {
        transactionId: order.payment.transactionId || `FP-${Date.now()}`,
        paymentMethod: order.payment.method,
        amount: order.pricing.total,
        confirmedAt: order.payment.paidAt || new Date()
      };

      const pdfResult = await saveReceiptToFile(order, paymentDetails);

      // Create receipt record
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
        pdfPath: pdfResult.filePath,
        status: 'generated'
      });

      await receipt.save();

      // Update receipt with correct URL
      receipt.pdfUrl = `/api/receipts/download/${receipt._id}`;
      await receipt.save();

      generatedReceipts.push({
        id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        orderNumber: receipt.orderNumber,
        customerName: order.customerId.name
      });
    }

    res.json({
      success: true,
      message: `Generated ${generatedReceipts.length} receipts for all paid orders`,
      receipts: generatedReceipts
    });
  } catch (error) {
    console.error('Error generating receipts for all paid orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate receipts for all paid orders' 
    });
  }
});

export default router; 