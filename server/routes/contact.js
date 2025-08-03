import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Contact } from '../models/Contact.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Submit contact form (public route)
router.post('/',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters'),
    body('phone')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Please provide a valid phone number'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters')
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

      const { name, email, subject, phone, message } = req.body;

      // Create contact message
      const contact = new Contact({
        name,
        email,
        subject,
        phone,
        message,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await contact.save();

      res.status(201).json({
        message: 'Message sent successfully! We\'ll get back to you soon.',
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          createdAt: contact.createdAt
        }
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({
        message: 'Failed to send message. Please try again.',
        error: error.message
      });
    }
  }
);

// Get all contact messages (admin only)
router.get('/',
  requireAuth,
  requireRole(['admin']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['unread', 'read', 'replied', 'archived']),
    query('priority').optional().isIn(['low', 'medium', 'high']),
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
      
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      
      if (req.query.search) {
        query.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
          { subject: { $regex: req.query.search, $options: 'i' } },
          { message: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const [contacts, total] = await Promise.all([
        Contact.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('repliedBy', 'name email')
          .lean(),
        Contact.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        contacts,
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
      console.error('Error fetching contact messages:', error);
      res.status(500).json({
        message: 'Failed to fetch contact messages',
        error: error.message
      });
    }
  }
);

// Get contact message by ID (admin only)
router.get('/:id',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const contact = await Contact.findById(req.params.id)
        .populate('repliedBy', 'name email')
        .lean();

      if (!contact) {
        return res.status(404).json({
          message: 'Contact message not found'
        });
      }

      res.json({ contact });
    } catch (error) {
      console.error('Error fetching contact message:', error);
      res.status(500).json({
        message: 'Failed to fetch contact message',
        error: error.message
      });
    }
  }
);

// Mark contact message as read (admin only)
router.patch('/:id/read',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const contact = await Contact.findById(req.params.id);
      
      if (!contact) {
        return res.status(404).json({
          message: 'Contact message not found'
        });
      }

      await contact.markAsRead(req.user._id);

      res.json({
        message: 'Message marked as read',
        contact: {
          id: contact._id,
          status: contact.status
        }
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({
        message: 'Failed to mark message as read',
        error: error.message
      });
    }
  }
);

// Reply to contact message (admin only)
router.patch('/:id/reply',
  requireAuth,
  requireRole(['admin']),
  [
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters')
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

      const contact = await Contact.findById(req.params.id);
      
      if (!contact) {
        return res.status(404).json({
          message: 'Contact message not found'
        });
      }

      await contact.reply(req.user._id, req.body.notes);

      res.json({
        message: 'Reply sent successfully',
        contact: {
          id: contact._id,
          status: contact.status,
          repliedAt: contact.repliedAt,
          adminNotes: contact.adminNotes
        }
      });
    } catch (error) {
      console.error('Error replying to message:', error);
      res.status(500).json({
        message: 'Failed to send reply',
        error: error.message
      });
    }
  }
);

// Update contact message status (admin only)
router.patch('/:id/status',
  requireAuth,
  requireRole(['admin']),
  [
    body('status')
      .isIn(['unread', 'read', 'replied', 'archived'])
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

      const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );

      if (!contact) {
        return res.status(404).json({
          message: 'Contact message not found'
        });
      }

      res.json({
        message: 'Status updated successfully',
        contact: {
          id: contact._id,
          status: contact.status
        }
      });
    } catch (error) {
      console.error('Error updating message status:', error);
      res.status(500).json({
        message: 'Failed to update status',
        error: error.message
      });
    }
  }
);

// Get contact statistics (admin only)
router.get('/stats/overview',
  requireAuth,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const [
        totalMessages,
        unreadMessages,
        urgentMessages,
        todayMessages,
        thisWeekMessages,
        statusBreakdown
      ] = await Promise.all([
        Contact.countDocuments(),
        Contact.countDocuments({ status: 'unread' }),
        Contact.getUrgentMessages().countDocuments(),
        Contact.countDocuments({
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }),
        Contact.countDocuments({
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }),
        Contact.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      res.json({
        stats: {
          totalMessages,
          unreadMessages,
          urgentMessages,
          todayMessages,
          thisWeekMessages,
          statusBreakdown: statusBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        }
      });
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      res.status(500).json({
        message: 'Failed to fetch contact statistics',
        error: error.message
      });
    }
  }
);

export default router; 