import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

const router = express.Router();

// Get seller dashboard stats
router.get('/dashboard/stats', requireAuth, requireRole(['seller']), async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get total sales
    const totalSales = await Order.aggregate([
      { $match: { 'items.productInfo.seller': userId.toString() } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    // Get total orders
    const totalOrders = await Order.countDocuments({
      'items.productInfo.seller': userId.toString()
    });

    // Get active products
    const activeProducts = await Product.countDocuments({
      seller: userId,
      status: 'active'
    });

    // Get pending orders
    const pendingOrders = await Order.countDocuments({
      'items.productInfo.seller': userId.toString(),
      status: 'pending'
    });

    // Get monthly revenue (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          'items.productInfo.seller': userId.toString(),
          createdAt: { $gte: currentMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const stats = {
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      activeProducts,
      averageRating: 4.5, // Placeholder
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      pendingOrders
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching seller dashboard stats:', error);
    res.status(500).json({
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

// Get seller's recent orders
router.get('/orders/recent', requireAuth, requireRole(['seller']), async (req, res) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({
      'items.productInfo.seller': userId.toString()
    })
    .populate('customer', 'name email phone')
    .populate('items.product', 'name nameBn image')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Format orders for seller view
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      items: order.items,
      total: order.pricing.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Update order status (seller)
router.patch('/orders/:orderId/status', requireAuth, requireRole(['seller']), [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if seller owns any products in this order
    const hasSellerProducts = order.items.some(item => 
      item.productInfo.seller === req.user._id.toString()
    );

    if (!hasSellerProducts) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = req.body.status;
    order.updatedAt = new Date();
    
    // Add to timeline
    order.timeline.push({
      status: req.body.status,
      message: `Order status updated to ${req.body.status}`,
      timestamp: new Date()
    });

    await order.save();

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
});

// Get seller's products
router.get('/products', requireAuth, requireRole(['seller']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { seller: req.user._id };
    if (status) query.status = status;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      message: 'Error fetching products',
      error: error.message
    });
  }
});

export default router; 