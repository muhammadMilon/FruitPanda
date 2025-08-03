import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  repliedAt: Date,
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ priority: 1 });

// Virtual for message age
contactSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is urgent (unread messages older than 24 hours)
contactSchema.virtual('isUrgent').get(function() {
  return this.status === 'unread' && this.age > 1;
});

// Static method to get unread count
contactSchema.statics.getUnreadCount = function() {
  return this.countDocuments({ status: 'unread' });
};

// Static method to get urgent messages
contactSchema.statics.getUrgentMessages = function() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.find({
    status: 'unread',
    createdAt: { $lt: yesterday }
  }).sort({ createdAt: 1 });
};

// Method to mark as read
contactSchema.methods.markAsRead = function(adminId) {
  this.status = 'read';
  return this.save();
};

// Method to reply to message
contactSchema.methods.reply = function(adminId, notes) {
  this.status = 'replied';
  this.repliedAt = new Date();
  this.repliedBy = adminId;
  if (notes) {
    this.adminNotes = notes;
  }
  return this.save();
};

export const Contact = mongoose.model('Contact', contactSchema); 