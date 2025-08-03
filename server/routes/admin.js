import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Blog } from '../models/Blog.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard/stats',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const [
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
        recentOrders,
        topProducts,
        userGrowth,
        orderStats
      ] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'seller' }),
        Product.countDocuments({ status: 'active' }),
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.aggregate([
          { $match: { status: { $in: ['delivered', 'processing'] } } },
          { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]),
        Order.find()
          .populate('customer', 'name email')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Product.find({ status: 'active' })
          .sort({ 'analytics.purchases': -1 })
          .limit(5)
          .lean(),
        User.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 }
        ]),
        Order.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      const revenue = totalRevenue[0]?.total || 0;

      res.json({
        stats: {
          totalUsers,
          totalSellers,
          totalProducts,
          totalOrders,
          pendingOrders,
          totalRevenue: revenue
        },
        recentOrders,
        topProducts,
        userGrowth,
        orderStats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        message: 'Error fetching dashboard stats',
        error: error.message
      });
    }
  }
);

// Get all users
router.get('/users',
  requireAuth,
  requireRole(['admin']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['user', 'seller', 'admin']),
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
        role,
        search
      } = req.query;

      const query = {};
      if (role) query.role = role;
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        User.countDocuments(query)
      ]);

      res.json({
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        message: 'Error fetching users',
        error: error.message
      });
    }
  }
);

// Update user role
router.patch('/users/:id/role',
  requireAuth,
  requireRole(['admin']),
  [
    body('role')
      .isIn(['user', 'seller', 'admin'])
      .withMessage('Invalid role')
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
      const { role } = req.body;

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: 'User role updated successfully',
        user
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        message: 'Error updating user role',
        error: error.message
      });
    }
  }
);

// Deactivate/activate user
router.patch('/users/:id/status',
  requireAuth,
  requireRole(['admin']),
  [
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be a boolean')
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
      const { isActive } = req.body;

      const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({
        message: 'Error updating user status',
        error: error.message
      });
    }
  }
);

// Verify seller
router.patch('/sellers/:id/verify',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      if (user.role !== 'seller') {
        return res.status(400).json({
          message: 'User is not a seller'
        });
      }

      user.sellerInfo.verified = true;
      await user.save();

      res.json({
        message: 'Seller verified successfully',
        user: user.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } })
      });
    } catch (error) {
      console.error('Error verifying seller:', error);
      res.status(500).json({
        message: 'Error verifying seller',
        error: error.message
      });
    }
  }
);

// Get all products for admin
router.get('/products',
  requireAuth,
  requireRole(['admin']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'inactive', 'out_of_stock', 'discontinued']),
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
          { name: { $regex: search, $options: 'i' } },
          { nameBn: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [products, total] = await Promise.all([
        Product.find(query)
          .populate('seller', 'name email sellerInfo')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Product.countDocuments(query)
      ]);

      res.json({
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        message: 'Error fetching products',
        error: error.message
      });
    }
  }
);

// Update product status
router.patch('/products/:id/status',
  requireAuth,
  requireRole(['admin']),
  [
    body('status')
      .isIn(['active', 'inactive', 'out_of_stock', 'discontinued'])
      .withMessage('Invalid status')
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
      const { status } = req.body;

      const product = await Product.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('seller', 'name email');

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      res.json({
        message: 'Product status updated successfully',
        product
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      res.status(500).json({
        message: 'Error updating product status',
        error: error.message
      });
    }
  }
);

// Get all orders (admin)
router.get('/orders',
  requireAuth,
  requireRole(['admin']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
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

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      if (req.query.search) {
        query.$or = [
          { orderNumber: { $regex: req.query.search, $options: 'i' } },
          { 'customerInfo.name': { $regex: req.query.search, $options: 'i' } },
          { 'customerInfo.email': { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('customer', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
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

// Get system analytics
router.get('/analytics',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const [
        salesAnalytics,
        userAnalytics,
        productAnalytics,
        orderAnalytics
      ] = await Promise.all([
        // Sales analytics
        Order.aggregate([
          {
            $match: {
              status: { $in: ['delivered', 'processing'] },
              createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              revenue: { $sum: '$pricing.total' },
              orders: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),
        
        // User analytics
        User.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              users: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 }
        ]),
        
        // Product analytics
        Product.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              avgPrice: { $avg: '$price' }
            }
          }
        ]),
        
        // Order analytics
        Order.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              orders: { $sum: 1 },
              revenue: { $sum: '$pricing.total' }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 }
        ])
      ]);

      res.json({
        salesAnalytics,
        userAnalytics,
        productAnalytics,
        orderAnalytics
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        message: 'Error fetching analytics',
        error: error.message
      });
    }
  }
);

// Seller Application Management Routes

// Get all seller applications (admin only)
router.get('/seller-applications',
  requireAuth,
  requireRole(['admin']),
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
    query('search').optional().trim()
  ],
  async (req, res) => {
    console.log('Admin user requesting seller applications:', req.user._id, req.user.role);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const query = {};
      if (req.query.status) query['sellerApplication.status'] = req.query.status;
      if (req.query.search) {
        query.$or = [
          { 'sellerApplication.personalInfo.fullName': { $regex: req.query.search, $options: 'i' } },
          { 'sellerApplication.personalInfo.email': { $regex: req.query.search, $options: 'i' } },
          { 'sellerApplication.businessInfo.businessName': { $regex: req.query.search, $options: 'i' } },
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      console.log('Query for seller applications:', query);
      
      const applications = await User.find({ 
        'sellerApplication': { $exists: true },
        ...query 
      })
      .select('name email sellerApplication createdAt')
      .sort({ createdAt: -1 })
      .lean();

      console.log('Found applications:', applications.length);
      console.log('First application:', applications[0]);

      const formattedApplications = applications.map(app => {
        const sellerApp = app.sellerApplication || {};
        
        return {
          _id: app._id,
          user: {
            _id: app._id,
            name: app.name,
            email: app.email
          },
          personalInfo: {
            fullName: sellerApp.personalInfo?.fullName || app.name || 'N/A',
            email: sellerApp.personalInfo?.email || app.email || 'N/A',
            phone: sellerApp.personalInfo?.phone || 'N/A',
            nid: sellerApp.personalInfo?.nid || 'N/A'
          },
          businessInfo: {
            businessName: sellerApp.businessInfo?.businessName || 'N/A',
            businessType: sellerApp.businessInfo?.businessType || 'N/A',
            experience: sellerApp.businessInfo?.experience || 'N/A',
            specialization: sellerApp.businessInfo?.specialization || [],
            businessAddress: sellerApp.businessInfo?.businessAddress || 'N/A',
            city: sellerApp.businessInfo?.city || 'N/A',
            district: sellerApp.businessInfo?.district || 'N/A'
          },
          bankingInfo: {
            bankName: sellerApp.bankingInfo?.bankName || 'N/A',
            accountNumber: sellerApp.bankingInfo?.accountNumber || 'N/A',
            accountHolderName: sellerApp.bankingInfo?.accountHolderName || 'N/A'
          },
          status: sellerApp.status || 'pending',
          submittedAt: sellerApp.submittedAt || app.createdAt,
          approvedAt: sellerApp.approvedAt,
          rejectedAt: sellerApp.rejectedAt,
          adminComments: sellerApp.adminComments,
          rejectionReason: sellerApp.rejectionReason
        };
      });

      console.log('Formatted applications:', formattedApplications.length);
      console.log('Response data:', { applications: formattedApplications });

      res.json({ applications: formattedApplications });
    } catch (error) {
      console.error('Error fetching seller applications:', error);
      res.status(500).json({
        message: 'Error fetching applications',
        error: error.message
      });
    }
  }
);

// Approve seller application (admin only)
router.patch('/seller-applications/:applicationId/approve',
  requireAuth,
  requireRole(['admin']),
  [
    body('comments').optional().trim()
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

      const user = await User.findById(req.params.applicationId);
      if (!user || !user.sellerApplication) {
        return res.status(404).json({ message: 'Seller application not found' });
      }

      user.sellerApplication.status = 'approved';
      user.sellerApplication.approvedAt = new Date();
      user.sellerApplication.adminComments = req.body.comments || 'Application approved';
      user.role = 'seller';

      await user.save();

      res.json({
        message: 'Seller application approved successfully',
        application: user.sellerApplication
      });
    } catch (error) {
      console.error('Error approving seller application:', error);
      res.status(500).json({
        message: 'Error approving application',
        error: error.message
      });
    }
  }
);

// Reject seller application (admin only)
router.patch('/seller-applications/:applicationId/reject',
  requireAuth,
  requireRole(['admin']),
  [
    body('rejectionReason').notEmpty().withMessage('Rejection reason is required')
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

      const user = await User.findById(req.params.applicationId);
      if (!user || !user.sellerApplication) {
        return res.status(404).json({ message: 'Seller application not found' });
      }

      user.sellerApplication.status = 'rejected';
      user.sellerApplication.rejectedAt = new Date();
      user.sellerApplication.rejectionReason = req.body.rejectionReason;

      await user.save();

      res.json({
        message: 'Seller application rejected successfully',
        application: user.sellerApplication
      });
    } catch (error) {
      console.error('Error rejecting seller application:', error);
      res.status(500).json({
        message: 'Error rejecting application',
        error: error.message
      });
    }
  }
);

export default router;