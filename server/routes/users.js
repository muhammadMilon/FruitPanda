import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { query } from 'express-validator';

const router = express.Router();

// Get user profile
router.get('/profile', 
  requireAuth,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({ 
        user: user.toObject({ virtuals: true })
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        message: 'Error fetching profile',
        error: error.message
      });
    }
  }
);

// Update user profile
router.put('/profile',
  requireAuth,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    body('address.street')
      .optional()
      .trim(),
    body('address.city')
      .optional()
      .trim(),
    body('address.state')
      .optional()
      .trim(),
    body('address.zipCode')
      .optional()
      .trim(),
    body('preferences.language')
      .optional()
      .isIn(['en', 'bn'])
      .withMessage('Language must be en or bn'),
    body('preferences.notifications.email')
      .optional()
      .isBoolean(),
    body('preferences.notifications.sms')
      .optional()
      .isBoolean(),
    body('preferences.notifications.push')
      .optional()
      .isBoolean()
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

      const updateData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.email;
      delete updateData.password;
      delete updateData.role;
      delete updateData.emailVerified;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        message: 'Profile updated successfully',
        user: user.toObject({ virtuals: true })
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        message: 'Error updating profile',
        error: error.message
      });
    }
  }
);

// Change password
router.patch('/change-password',
  requireAuth,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
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

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user.id).select('+password');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        message: 'Error changing password',
        error: error.message
      });
    }
  }
);

// Get user's order history
router.get('/orders',
  requireAuth,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const query = { customer: req.user.id };
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

// Get user statistics
router.get('/stats',
  requireAuth,
  async (req, res) => {
    try {
      const [
        totalOrders,
        totalSpent,
        recentOrders,
        favoriteCategories
      ] = await Promise.all([
        Order.countDocuments({ customer: req.user.id }),
        Order.aggregate([
          { $match: { customer: req.user.id, status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]),
        Order.find({ customer: req.user.id })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('items.product', 'name nameBn')
          .lean(),
        Order.aggregate([
          { $match: { customer: req.user.id } },
          { $unwind: '$items' },
          { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
          { $unwind: '$product' },
          { $group: { _id: '$product.category', count: { $sum: '$items.quantity' } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ])
      ]);

      const spent = totalSpent[0]?.total || 0;

      res.json({
        totalOrders,
        totalSpent: spent,
        recentOrders,
        favoriteCategories
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        message: 'Error fetching user statistics',
        error: error.message
      });
    }
  }
);

// Update seller information
router.patch('/seller-info',
  requireAuth,
  [
    body('businessName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be between 2 and 100 characters'),
    body('businessType')
      .optional()
      .isIn(['farmer', 'wholesaler', 'retailer'])
      .withMessage('Invalid business type'),
    body('businessAddress')
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage('Business address is required'),
    body('taxId')
      .optional()
      .trim()
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

      const user = await User.findById(req.user._id);

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

      // Update seller info
      Object.assign(user.sellerInfo, req.body);
      await user.save();

      res.json({
        message: 'Seller information updated successfully',
        sellerInfo: user.sellerInfo
      });
    } catch (error) {
      console.error('Error updating seller info:', error);
      res.status(500).json({
        message: 'Error updating seller information',
        error: error.message
      });
    }
  }
);

// Delete user account
router.delete('/account',
  requireAuth,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required to delete account'),
    body('confirmDelete')
      .equals('DELETE')
      .withMessage('Please type DELETE to confirm account deletion')
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

      const { password } = req.body;

      // Get user with password
      const user = await User.findById(req.user._id).select('+password');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          message: 'Incorrect password'
        });
      }

      // Check for pending orders
      const pendingOrders = await Order.countDocuments({
        customer: req.user._id,
        status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
      });

      if (pendingOrders > 0) {
        return res.status(400).json({
          message: 'Cannot delete account with pending orders. Please wait for all orders to be completed or cancelled.'
        });
      }

      // Soft delete - deactivate account instead of hard delete
      user.isActive = false;
      user.email = `deleted_${Date.now()}_${user.email}`;
      await user.save();

      res.json({
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({
        message: 'Error deleting account',
        error: error.message
      });
    }
  }
);

// Payment Methods Routes
// Get user's payment methods
router.get('/payment-methods',
  requireAuth,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate('paymentMethods');
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json({
        paymentMethods: user.paymentMethods || []
      });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({
        message: 'Error fetching payment methods',
        error: error.message
      });
    }
  }
);

// Add new payment method
router.post('/payment-methods',
  requireAuth,
  [
    body('type')
      .isIn(['bkash', 'nagad', 'credit_card', 'debit_card'])
      .withMessage('Valid payment method type is required'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('number')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Number must be between 4 and 20 characters')
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

      const { type, name, number, isDefault = false } = req.body;

      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Initialize paymentMethods array if it doesn't exist
      if (!user.paymentMethods) {
        user.paymentMethods = [];
      }

      // If this is the first payment method, make it default
      if (user.paymentMethods.length === 0) {
        isDefault = true;
      }

      // If setting as default, remove default from other methods
      if (isDefault) {
        user.paymentMethods.forEach(method => {
          method.isDefault = false;
        });
      }

      const newPaymentMethod = {
        type,
        name,
        number,
        isDefault,
        isActive: true,
        addedAt: new Date()
      };

      user.paymentMethods.push(newPaymentMethod);
      await user.save();

      res.json({
        message: 'Payment method added successfully',
        paymentMethod: newPaymentMethod
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      res.status(500).json({
        message: 'Error adding payment method',
        error: error.message
      });
    }
  }
);

// Update payment method
router.put('/payment-methods/:methodId',
  requireAuth,
  [
    body('type')
      .isIn(['bkash', 'nagad', 'credit_card', 'debit_card'])
      .withMessage('Valid payment method type is required'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('number')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Number must be between 4 and 20 characters')
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

      const { methodId } = req.params;
      const { type, name, number } = req.body;

      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      const paymentMethod = user.paymentMethods.id(methodId);
      
      if (!paymentMethod) {
        return res.status(404).json({
          message: 'Payment method not found'
        });
      }

      paymentMethod.type = type;
      paymentMethod.name = name;
      paymentMethod.number = number;

      await user.save();

      res.json({
        message: 'Payment method updated successfully',
        paymentMethod
      });
    } catch (error) {
      console.error('Error updating payment method:', error);
      res.status(500).json({
        message: 'Error updating payment method',
        error: error.message
      });
    }
  }
);

// Delete payment method
router.delete('/payment-methods/:methodId',
  requireAuth,
  async (req, res) => {
    try {
      const { methodId } = req.params;

      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      const paymentMethod = user.paymentMethods.id(methodId);
      
      if (!paymentMethod) {
        return res.status(404).json({
          message: 'Payment method not found'
        });
      }

      // Don't allow deletion if it's the only payment method
      if (user.paymentMethods.length === 1) {
        return res.status(400).json({
          message: 'Cannot delete the only payment method'
        });
      }

      paymentMethod.remove();
      await user.save();

      res.json({
        message: 'Payment method deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      res.status(500).json({
        message: 'Error deleting payment method',
        error: error.message
      });
    }
  }
);

// Set default payment method
router.patch('/payment-methods/:methodId/default',
  requireAuth,
  async (req, res) => {
    try {
      const { methodId } = req.params;

      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Remove default from all payment methods
      user.paymentMethods.forEach(method => {
        method.isDefault = false;
      });

      // Set the specified method as default
      const paymentMethod = user.paymentMethods.id(methodId);
      
      if (!paymentMethod) {
        return res.status(404).json({
          message: 'Payment method not found'
        });
      }

      paymentMethod.isDefault = true;
      await user.save();

      res.json({
        message: 'Default payment method updated successfully',
        paymentMethod
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      res.status(500).json({
        message: 'Error setting default payment method',
        error: error.message
      });
    }
  }
);

// Seller Application Routes
// Test route to check seller applications (temporary)
router.get('/seller-applications/test', requireAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const usersWithApplications = await User.countDocuments({ 'sellerApplication': { $exists: true } });
    const applications = await User.find({ 'sellerApplication': { $exists: true } })
      .select('name email sellerApplication.status')
      .lean();

    res.json({
      totalUsers,
      usersWithApplications,
      applications: applications.map(app => ({
        userId: app._id,
        name: app.name,
        email: app.email,
        status: app.sellerApplication?.status
      }))
    });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ error: error.message });
  }
});

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
          { 'sellerApplication.businessInfo.businessName': { $regex: req.query.search, $options: 'i' } }
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

      const formattedApplications = applications.map(app => ({
        _id: app._id,
        user: {
          _id: app._id,
          name: app.name,
          email: app.email
        },
        personalInfo: app.sellerApplication.personalInfo,
        businessInfo: app.sellerApplication.businessInfo,
        status: app.sellerApplication.status,
        submittedAt: app.sellerApplication.submittedAt
      }));

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

// Get my seller application
router.get('/seller-applications/my-application',
  requireAuth,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.sellerApplication) {
        return res.status(404).json({ message: 'No seller application found' });
      }

      res.json({ application: user.sellerApplication });
    } catch (error) {
      console.error('Error fetching my seller application:', error);
      res.status(500).json({
        message: 'Error fetching application',
        error: error.message
      });
    }
  }
);

// Submit seller application
router.post('/seller-applications/submit',
  requireAuth,
  [
    body('personalInfo.fullName').notEmpty().withMessage('Full name is required'),
    body('personalInfo.email').isEmail().withMessage('Valid email is required'),
    body('personalInfo.phone').notEmpty().withMessage('Phone number is required'),
    body('personalInfo.nid').notEmpty().withMessage('NID is required'),
    body('businessInfo.businessName').notEmpty().withMessage('Business name is required'),
    body('businessInfo.businessType').notEmpty().withMessage('Business type is required'),
    body('businessInfo.experience').notEmpty().withMessage('Experience is required'),
    body('businessInfo.businessAddress').notEmpty().withMessage('Business address is required'),
    body('businessInfo.city').notEmpty().withMessage('City is required'),
    body('businessInfo.district').notEmpty().withMessage('District is required'),
    body('bankingInfo.bankName').notEmpty().withMessage('Bank name is required'),
    body('bankingInfo.accountNumber').notEmpty().withMessage('Account number is required'),
    body('bankingInfo.accountHolderName').notEmpty().withMessage('Account holder name is required'),
    body('agreeToTerms').equals(true).withMessage('You must agree to terms and conditions')
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

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user already has an application
      if (user.sellerApplication) {
        return res.status(400).json({ message: 'You already have a seller application' });
      }

      console.log('Creating seller application for user:', req.user.id);
      console.log('Application data:', req.body);

      // Create seller application
      user.sellerApplication = {
        personalInfo: req.body.personalInfo,
        businessInfo: req.body.businessInfo,
        bankingInfo: req.body.bankingInfo,
        documents: req.body.documents || {},
        additionalInfo: req.body.additionalInfo || '',
        status: 'pending',
        submittedAt: new Date()
      };

      await user.save();
      console.log('Seller application saved successfully for user:', user._id);

      res.status(201).json({
        message: 'Seller application submitted successfully',
        application: user.sellerApplication
      });
    } catch (error) {
      console.error('Error submitting seller application:', error);
      res.status(500).json({
        message: 'Error submitting application',
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