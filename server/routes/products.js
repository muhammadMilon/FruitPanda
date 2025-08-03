import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Product } from '../models/Product.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('nameBn')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bangla product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('descriptionBn')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Bangla description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['Seasonal', 'Regular', 'Exotic', 'Organic', 'Imported'])
    .withMessage('Invalid category'),
  body('unit')
    .isIn(['kg', 'piece', 'dozen', 'gram', 'liter'])
    .withMessage('Invalid unit'),
  body('weight.value')
    .isFloat({ min: 0 })
    .withMessage('Weight value must be positive'),
  body('weight.unit')
    .isIn(['kg', 'g'])
    .withMessage('Weight unit must be kg or g'),
  body('inventory.stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('origin.region')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Origin region is required')
];

// Get all products (public)
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('category').optional().trim(),
    query('search').optional().trim(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('organic').optional().isBoolean(),
    query('inStock').optional().isBoolean(),
    query('sort').optional().isIn(['price-asc', 'price-desc', 'rating', 'newest'])
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
        limit = 12,
        category,
        search,
        minPrice,
        maxPrice,
        organic,
        inStock = true,
        sort = 'newest'
      } = req.query;

      // Build query
      const query = { status: 'active' };
      
      if (inStock === 'true') {
        query['inventory.available'] = { $gt: 0 };
      }

      if (category) {
        query.category = category;
      }

      if (organic === 'true') {
        query['features.organic'] = true;
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { nameBn: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Sort options
      let sortOption = {};
      switch (sort) {
        case 'price-asc':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { 'ratings.average': -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [products, total] = await Promise.all([
        Product.find(query)
          .populate('seller', 'name sellerInfo')
          .sort(sortOption)
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

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('seller', 'name sellerInfo')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Increment views
    await product.incrementViews();

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Create new product (seller/admin only)
router.post('/',
  requireAuth,
  requireRole(['seller', 'admin']),
  productValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const productData = {
        ...req.body,
        seller: req.user._id,
        sellerInfo: {
          name: req.user.name,
          verified: req.user.sellerInfo?.verified || false,
          rating: req.user.sellerInfo?.rating || 0
        }
      };

      // Generate unique slug
      let baseSlug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let slug = baseSlug;
      let counter = 1;

      while (await Product.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      productData.slug = slug;

      const product = await Product.create(productData);
      await product.populate('seller', 'name sellerInfo');

      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        message: 'Error creating product',
        error: error.message
      });
    }
  }
);

// Update product (seller/admin only)
router.put('/:id',
  requireAuth,
  requireRole(['seller', 'admin']),
  productValidation,
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
      const updateData = req.body;

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      // Check if user can update this product
      if (req.user.role !== 'admin' && 
          product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('seller', 'name sellerInfo');

      res.json({
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        message: 'Error updating product',
        error: error.message
      });
    }
  }
);

// Delete product (seller/admin only)
router.delete('/:id',
  requireAuth,
  requireRole(['seller', 'admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      // Check if user can delete this product
      if (req.user.role !== 'admin' && 
          product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'Access denied'
        });
      }

      await Product.findByIdAndDelete(id);

      res.json({
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        message: 'Error deleting product',
        error: error.message
      });
    }
  }
);

// Add product review
router.post('/:id/reviews',
  requireAuth,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters')
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
      const { rating, comment } = req.body;

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      // Check if user already reviewed this product
      const existingReview = product.reviews.find(
        review => review.user.toString() === req.user._id.toString()
      );

      if (existingReview) {
        return res.status(400).json({
          message: 'You have already reviewed this product'
        });
      }

      const review = {
        user: req.user._id,
        name: req.user.name,
        rating,
        comment,
        verified: false // Can be set to true if user purchased the product
      };

      await product.addReview(review);

      res.status(201).json({
        message: 'Review added successfully',
        review
      });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({
        message: 'Error adding review',
        error: error.message
      });
    }
  }
);

// Get seller's products
router.get('/seller/my-products',
  requireAuth,
  requireRole(['seller', 'admin']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['active', 'inactive', 'out_of_stock', 'discontinued'])
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

      const query = { seller: req.user._id };
      if (status) query.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

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
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      console.error('Error fetching seller products:', error);
      res.status(500).json({
        message: 'Error fetching products',
        error: error.message
      });
    }
  }
);

// Get product categories and filters (public)
router.get('/meta/filters', async (req, res) => {
  try {
    const [categories, origins, priceRange] = await Promise.all([
      Product.distinct('category', { status: 'active' }),
      Product.distinct('origin.region', { status: 'active' }),
      Product.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ])
    ]);

    res.json({
      categories,
      origins,
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 }
    });
  } catch (error) {
    console.error('Error fetching product filters:', error);
    res.status(500).json({
      message: 'Error fetching filters',
      error: error.message
    });
  }
});

export default router;