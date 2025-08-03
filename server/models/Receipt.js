import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productInfo: {
      name: String,
      nameBn: String,
      image: String
    },
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  pricing: {
    subtotal: Number,
    deliveryFee: Number,
    discount: Number,
    total: Number
  },
  payment: {
    method: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    area: String,
    phone: String,
    instructions: String
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  pdfPath: String,
  pdfUrl: String,
  generatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['generated', 'sent', 'downloaded'],
    default: 'generated'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    downloadCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Generate receipt number
receiptSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of receipts for today
    const todayReceipts = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    });
    
    this.receiptNumber = `RCP-${year}${month}${day}-${String(todayReceipts + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes for better performance
receiptSchema.index({ orderId: 1 });
receiptSchema.index({ customerId: 1 });
receiptSchema.index({ receiptNumber: 1 });
receiptSchema.index({ createdAt: -1 });
receiptSchema.index({ 'payment.status': 1 });

// Virtual for formatted receipt number
receiptSchema.virtual('formattedReceiptNumber').get(function() {
  return this.receiptNumber;
});

// Virtual for total items count
receiptSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to update download count
receiptSchema.methods.incrementDownloadCount = function() {
  this.metadata.downloadCount += 1;
  this.status = 'downloaded';
  return this.save();
};

// Method to mark as sent
receiptSchema.methods.markAsSent = function() {
  this.status = 'sent';
  return this.save();
};

// Static method to find receipts by customer
receiptSchema.statics.findByCustomer = function(customerId, limit = 10, skip = 0) {
  return this.find({ customerId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('orderId', 'orderNumber status')
    .populate('customerId', 'name email');
};

// Static method to find receipts by order
receiptSchema.statics.findByOrder = function(orderId) {
  return this.findOne({ orderId })
    .populate('orderId')
    .populate('customerId', 'name email');
};

const Receipt = mongoose.model('Receipt', receiptSchema);

export { Receipt }; 