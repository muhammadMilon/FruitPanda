import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  nameBn: {
    type: String,
    required: [true, 'Bangla product name is required'],
    trim: true,
    maxlength: [100, 'Bangla product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  descriptionBn: {
    type: String,
    required: [true, 'Bangla product description is required'],
    maxlength: [2000, 'Bangla description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Seasonal', 'Regular', 'Exotic', 'Organic', 'Imported']
  },
  subcategory: {
    type: String,
    trim: true
  },
  variety: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'piece', 'dozen', 'gram', 'liter']
  },
  weight: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['kg', 'g'], default: 'kg' }
  },
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerInfo: {
    name: String,
    rating: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    location: String
  },
  inventory: {
    stock: { type: Number, required: true, min: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },
  origin: {
    region: { type: String, required: true },
    farm: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  nutritionFacts: {
    calories: Number,
    carbs: String,
    fiber: String,
    sugar: String,
    vitaminC: String,
    vitaminA: String,
    protein: String,
    fat: String
  },
  features: {
    organic: { type: Boolean, default: false },
    seasonal: { type: Boolean, default: false },
    imported: { type: Boolean, default: false },
    premium: { type: Boolean, default: false }
  },
  seasonality: {
    startMonth: { type: Number, min: 1, max: 12 },
    endMonth: { type: Number, min: 1, max: 12 },
    peakMonth: { type: Number, min: 1, max: 12 }
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    images: [String],
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  shipping: {
    freeShipping: { type: Boolean, default: false },
    minOrderForFreeShipping: Number,
    deliveryTime: {
      min: { type: Number, required: true }, // in days
      max: { type: Number, required: true }
    },
    shippingCost: { type: Number, default: 0 },
    availableRegions: [String]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  tags: [String],
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  },
  analytics: {
    views: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    cartAdditions: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'features.organic': 1 });
productSchema.index({ 'features.seasonal': 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'analytics.views': -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for availability
productSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.inventory.available > 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Generate slug from name
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Calculate available inventory
  this.inventory.available = Math.max(0, this.inventory.stock - this.inventory.reserved);
  
  // Update status based on inventory
  if (this.inventory.available === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  } else if (this.inventory.available > 0 && this.status === 'out_of_stock') {
    this.status = 'active';
  }
  
  next();
});

// Static method to get available products
productSchema.statics.getAvailable = function(filters = {}) {
  const query = { status: 'active', 'inventory.available': { $gt: 0 } };
  
  if (filters.category) query.category = filters.category;
  if (filters.seller) query.seller = filters.seller;
  if (filters.organic) query['features.organic'] = true;
  if (filters.seasonal) query['features.seasonal'] = true;
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }
  
  return this.find(query).populate('seller', 'name sellerInfo');
};

// Method to add review
productSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.ratings.average = totalRating / this.reviews.length;
  this.ratings.count = this.reviews.length;
  
  return this.save();
};

// Method to increment views
productSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to reserve inventory
productSchema.methods.reserveInventory = function(quantity) {
  if (this.inventory.available >= quantity) {
    this.inventory.reserved += quantity;
    return this.save();
  }
  throw new Error('Insufficient inventory');
};

export const Product = mongoose.model('Product', productSchema);