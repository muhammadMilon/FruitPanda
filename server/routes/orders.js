import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('items.*.productInfo.name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Product name is required'),
  body('shippingAddress.fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name is required'),
  body('shippingAddress.phone')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Valid phone number is required'),
  body('shippingAddress.address')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Address is required'),
  body('payment.method')
    .isIn(['bkash', 'nagad', 'cod', 'card'])
    .withMessage('Invalid payment method')
];

// Get user's orders
router.get('/my-orders',
  requireAuth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
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

      const {
        page = 1,
        limit = 10,
        status
      } = req.query;

      const query = { customer: req.user._id };
      if (status) query.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('items.product', 'name nameBn image')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Order.countDocuments(query)
      ]);

      res.json({
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalOrders: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({
        message: 'Error fetching orders',
        error: error.message
      });
    }
  }
);

// Get single order
router.get('/:id',
  requireAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findById(id)
        .populate('customer', 'name email phone')
        .populate('items.product', 'name nameBn image seller')
        .populate('items.productInfo.seller', 'name sellerInfo')
        .populate('timeline.updatedBy', 'name');

      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      // Check if user can access this order
      if (req.user.role !== 'admin' && 
          req.user.role !== 'seller' && 
          order.customer._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        message: 'Error fetching order',
        error: error.message
      });
    }
  }
);

// Create new order
router.post('/',
  requireAuth,
  createOrderValidation,
  async (req, res) => {
    try {
      console.log('Order creation request received:', {
        user: req.user._id,
        body: req.body
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { items, shippingAddress, payment } = req.body;

      // Process items directly from frontend data
      const processedItems = [];
      let subtotal = 0;

      for (const item of items) {
        // Use the data provided by frontend
        const itemSubtotal = item.subtotal || (item.price * item.quantity);
        subtotal += itemSubtotal;

        processedItems.push({
          product: null, // No database product reference since we're using frontend data
          productInfo: {
            name: item.productInfo.name,
            nameBn: item.productInfo.nameBn,
            image: item.productInfo.image,
            seller: null // No seller reference for now
          },
          quantity: item.quantity,
          price: item.price,
          weight: item.productInfo.weight,
          subtotal: itemSubtotal
        });
      }

      // Calculate delivery fee
      const deliveryFee = subtotal >= 1000 ? 0 : 60;
      const total = subtotal + deliveryFee;

      // Generate order number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const orderNumber = `ORD-${timestamp}-${random}`;

      // Create order
      const order = new Order({
        orderNumber,
        customer: req.user._id,
        customerInfo: {
          name: req.user.name,
          email: req.user.email,
          phone: shippingAddress.phone
        },
        items: processedItems,
        shippingAddress,
        pricing: {
          subtotal,
          deliveryFee,
          total
        },
        payment: {
          method: payment.method,
          status: 'pending'
        },
        timeline: [{
          status: 'pending',
          message: 'Order placed successfully',
          timestamp: new Date()
        }]
      });

      console.log('Saving order to database:', order);
      await order.save();
      console.log('Order saved successfully:', order.orderNumber);

      res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error creating order';
      if (error.name === 'ValidationError') {
        errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
      } else if (error.code === 11000) {
        errorMessage = 'Order number already exists';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      res.status(500).json({
        message: errorMessage,
        error: error.message
      });
    }
  }
);

// Update order status (admin/seller only)
router.patch('/:id/status',
  requireAuth,
  requireRole(['admin', 'seller']),
  [
    body('status')
      .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
    body('message').optional().trim()
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

      const { id } = req.params;
      const { status, message } = req.body;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      await order.updateStatus(status, req.user._id, message);

      res.json({
        message: 'Order status updated successfully',
        order
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        message: 'Error updating order status',
        error: error.message
      });
    }
  }
);

// Cancel order
router.patch('/:id/cancel',
  requireAuth,
  [
    body('reason').trim().isLength({ min: 5 }).withMessage('Cancellation reason is required')
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

      const { id } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }

      // Check if user can cancel this order
      if (req.user.role !== 'admin' && 
          order.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      // Check if order can be cancelled
      if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
        return res.status(400).json({
          message: 'Order cannot be cancelled at this stage'
        });
      }

      order.status = 'cancelled';
      order.cancellation = {
        reason,
        cancelledBy: req.user._id,
        cancelledAt: new Date()
      };

      order.timeline.push({
        status: 'cancelled',
        message: `Order cancelled: ${reason}`,
        timestamp: new Date(),
        updatedBy: req.user._id
      });

      await order.save();

      // Release reserved inventory (only if product exists in database)
      for (const item of order.items) {
        if (item.product) {
          const product = await Product.findById(item.product);
          if (product) {
            product.inventory.reserved -= item.quantity;
            await product.save();
          }
        }
      }

      res.json({
        message: 'Order cancelled successfully',
        order
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({
        message: 'Error cancelling order',
        error: error.message
      });
    }
  }
);

// Get all orders (admin only)
router.get('/',
  requireAuth,
  requireRole(['admin']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional(),
    query('search').optional().trim()
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

      const {
        page = 1,
        limit = 20,
        status,
        search
      } = req.query;

      const query = {};
      if (status) query.status = status;
      
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'customerInfo.name': { $regex: search, $options: 'i' } },
          { 'customerInfo.email': { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('customer', 'name email phone')
          .populate('items.product', 'name nameBn')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Order.countDocuments(query)
      ]);

      res.json({
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalOrders: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        message: 'Error fetching orders',
        error: error.message
      });
    }
  }
);

export default router;