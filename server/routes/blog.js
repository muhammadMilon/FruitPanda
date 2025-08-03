import express from 'express';
import { body, validationResult, query } from 'express-validator';
import passport from 'passport';
import { Blog } from '../models/Blog.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const blogValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('titleBn')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Bangla title must be between 5 and 200 characters'),
  body('excerpt')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Excerpt must be between 10 and 500 characters'),
  body('excerptBn')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Bangla excerpt must be between 10 and 500 characters'),
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  body('contentBn')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Bangla content must be at least 50 characters'),
  body('category')
    .isIn(['Fruit Guide', 'Health & Nutrition', 'Seasonal Guide', 'Recipes & Cooking', 'Exotic Fruits', 'Farming Tips'])
    .withMessage('Invalid category'),
  body('authorName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Author name must be between 2 and 100 characters'),
  body('authorNameBn')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bangla author name must be between 2 and 100 characters'),
];

// Get all published blog posts (public)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().trim(),
  query('language').optional().isIn(['en', 'bn', 'both']).withMessage('Invalid language'),
  query('search').optional().trim(),
  query('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
], async (req, res) => {
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
      category,
      language,
      search,
      featured,
      sort = 'publishedAt'
    } = req.query;

    // Build query
    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (language && language !== 'both') {
      query.$or = [
        { language: language },
        { language: 'both' }
      ];
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleBn: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { excerptBn: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { tagsBn: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'publishedAt':
        sortOption = { publishedAt: -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      case 'likes':
        sortOption = { 'likes.length': -1 };
        break;
      default:
        sortOption = { publishedAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Blog.countDocuments(query)
    ]);

    // Add virtual fields
    const postsWithVirtuals = posts.map(post => ({
      ...post,
      likeCount: post.likes ? post.likes.length : 0,
      commentCount: post.comments ? post.comments.filter(c => c.approved).length : 0
    }));

    res.json({
      posts: postsWithVirtuals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      message: 'Error fetching blog posts',
      error: error.message
    });
  }
});

// Get single blog post by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Blog.findOne({ 
      slug, 
      status: 'published' 
    })
    .populate('author', 'name avatar')
    .populate('comments.user', 'name avatar');

    if (!post) {
      return res.status(404).json({
        message: 'Blog post not found'
      });
    }

    // Increment views
    await post.incrementViews();

    // Filter approved comments
    const postData = post.toObject();
    postData.comments = postData.comments.filter(comment => comment.approved);
    postData.likeCount = post.likeCount;
    postData.commentCount = post.commentCount;

    res.json(postData);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      message: 'Error fetching blog post',
      error: error.message
    });
  }
});

// Get all blog posts for admin (admin only)
router.get('/admin/all',
  passport.authenticate('jwt', { session: false }),
  requireRole(['admin']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
    query('search').optional().trim(),
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
        search,
        sort = 'createdAt'
      } = req.query;

      // Build query
      const query = {};

      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { titleBn: { $regex: search, $options: 'i' } },
          { authorName: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOption = sort === 'createdAt' ? { createdAt: -1 } : { [sort]: -1 };

      const [posts, total] = await Promise.all([
        Blog.find(query)
          .populate('author', 'name avatar email')
          .sort(sortOption)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Blog.countDocuments(query)
      ]);

      res.json({
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPosts: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      });
    } catch (error) {
      console.error('Error fetching admin blog posts:', error);
      res.status(500).json({
        message: 'Error fetching blog posts',
        error: error.message
      });
    }
  }
);

// Create new blog post (admin only)
router.post('/',
  passport.authenticate('jwt', { session: false }),
  requireRole(['admin']),
  blogValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const blogData = {
        ...req.body,
        author: req.user._id
      };

      // Generate unique slug
      let baseSlug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let slug = baseSlug;
      let counter = 1;

      while (await Blog.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      blogData.slug = slug;

      const blog = await Blog.create(blogData);
      await blog.populate('author', 'name avatar email');

      res.status(201).json({
        message: 'Blog post created successfully',
        blog
      });
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({
        message: 'Error creating blog post',
        error: error.message
      });
    }
  }
);

// Update blog post (admin only)
router.put('/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole(['admin']),
  blogValidation,
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

      const blog = await Blog.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('author', 'name avatar email');

      if (!blog) {
        return res.status(404).json({
          message: 'Blog post not found'
        });
      }

      res.json({
        message: 'Blog post updated successfully',
        blog
      });
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({
        message: 'Error updating blog post',
        error: error.message
      });
    }
  }
);

// Delete blog post (admin only)
router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const blog = await Blog.findByIdAndDelete(id);

      if (!blog) {
        return res.status(404).json({
          message: 'Blog post not found'
        });
      }

      res.json({
        message: 'Blog post deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({
        message: 'Error deleting blog post',
        error: error.message
      });
    }
  }
);

// Like/Unlike blog post (authenticated users)
router.post('/:id/like',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({
          message: 'Blog post not found'
        });
      }

      const existingLike = blog.likes.find(like => 
        like.user.toString() === userId.toString()
      );

      if (existingLike) {
        // Unlike
        await blog.removeLike(userId);
        res.json({
          message: 'Blog post unliked',
          liked: false,
          likeCount: blog.likeCount
        });
      } else {
        // Like
        await blog.addLike(userId);
        res.json({
          message: 'Blog post liked',
          liked: true,
          likeCount: blog.likeCount
        });
      }
    } catch (error) {
      console.error('Error toggling blog like:', error);
      res.status(500).json({
        message: 'Error toggling blog like',
        error: error.message
      });
    }
  }
);

// Add comment to blog post (authenticated users)
router.post('/:id/comments',
  passport.authenticate('jwt', { session: false }),
  [
    body('content')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Comment must be between 5 and 1000 characters')
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
      const { content } = req.body;
      const user = req.user;

      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({
          message: 'Blog post not found'
        });
      }

      const comment = {
        user: user._id,
        name: user.name,
        email: user.email,
        content,
        approved: false // Comments need admin approval
      };

      blog.comments.push(comment);
      await blog.save();

      res.status(201).json({
        message: 'Comment added successfully. It will be visible after admin approval.',
        comment: {
          ...comment,
          user: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar
          }
        }
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        message: 'Error adding comment',
        error: error.message
      });
    }
  }
);

// Get blog categories and tags (public)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { status: 'published' });
    const tags = await Blog.distinct('tags', { status: 'published' });
    const tagsBn = await Blog.distinct('tagsBn', { status: 'published' });

    res.json({
      categories,
      tags: tags.filter(tag => tag && tag.trim()),
      tagsBn: tagsBn.filter(tag => tag && tag.trim())
    });
  } catch (error) {
    console.error('Error fetching blog metadata:', error);
    res.status(500).json({
      message: 'Error fetching blog metadata',
      error: error.message
    });
  }
});

export default router;