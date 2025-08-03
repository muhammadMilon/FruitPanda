import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false // Allow null for frontend-only orders
    },
    productInfo: {
      name: { type: String, required: true },
      nameBn: { type: String, required: true },
      image: String,
      seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    weight: String,
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    instructions: String
  },
  pricing: {
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  payment: {
    method: {
      type: String,
      enum: ['bkash', 'nagad', 'cod', 'card'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    submittedAt: Date,
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    adminNotes: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  tracking: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  timeline: [{
    status: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: {
    customerNotes: String,
    adminNotes: String,
    sellerNotes: String
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    // Generate a unique order number using timestamp and random number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  
  // Add timeline entry for status changes
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      message: `Order status changed to ${this.status}`,
      timestamp: new Date()
    });
  }
  
  next();
});

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status, options = {}) {
  const query = status ? { status } : {};
  
  return this.find(query)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name nameBn image')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50);
};

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, updatedBy, message) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    message: message || `Order status updated to ${newStatus}`,
    timestamp: new Date(),
    updatedBy
  });
  
  return this.save();
};

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.pricing.total = this.pricing.subtotal + this.pricing.deliveryFee - this.pricing.discount;
  return this;
};

export const Order = mongoose.model('Order', orderSchema);