import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Bangladesh' }
  },
  preferences: {
    language: { type: String, enum: ['en', 'bn'], default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  sellerInfo: {
    businessName: String,
    businessType: { type: String, enum: ['farmer', 'wholesaler', 'retailer'] },
    businessAddress: String,
    taxId: String,
    verified: { type: Boolean, default: false },
    verificationDocuments: [String],
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 }
  },
  sellerApplication: {
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      nid: String
    },
    businessInfo: {
      businessName: String,
      businessType: { type: String, enum: ['farmer', 'wholesaler', 'retailer'] },
      experience: String,
      specialization: [String],
      businessAddress: String,
      city: String,
      district: String
    },
    bankingInfo: {
      bankName: String,
      accountNumber: String,
      accountHolderName: String
    },
    documents: {
      nidImage: String,
      businessLicense: String,
      bankStatement: String
    },
    additionalInfo: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    adminComments: String,
    rejectionReason: String
  },
  paymentMethods: [{
    type: {
      type: String,
      enum: ['bkash', 'nagad', 'credit_card', 'debit_card'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    number: {
      type: String,
      required: true,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Remove duplicate index definitions to avoid warnings
// The unique: true in the schema definition is sufficient

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token payload
userSchema.methods.getAuthTokenPayload = function() {
  return {
    id: this._id,
    email: this.email,
    role: this.role,
    name: this.name
  };
};

// Static method to find user by email or Google ID
userSchema.statics.findByEmailOrGoogleId = function(email, googleId) {
  const query = { $or: [] };
  if (email) query.$or.push({ email });
  if (googleId) query.$or.push({ googleId });
  return this.findOne(query);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

export const User = mongoose.model('User', userSchema);