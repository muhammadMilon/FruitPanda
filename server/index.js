import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import blogRoutes from './routes/blog.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import paymentRoutes from './routes/payments.js';
import receiptRoutes from './routes/receipts.js';
import sellerRoutes from './routes/seller.js';

// Import models
import { User } from './models/User.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting - More permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration - Fixed for better frontend-backend communication
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://localhost:5174', // Alternative Vite port
      'http://localhost:4173'  // Vite preview port
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS allowed origin:', origin);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration - Fixed for better session handling
app.use(session({
  secret: process.env.SESSION_SECRET || 'fruit-panda-secret-key-super-secure',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to false for development
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// JWT Strategy - Fixed for better token handling
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fruit-panda-jwt-secret-super-secure'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id).select('-password');
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret || googleClientId === 'your-google-client-id') {
  console.warn('⚠️  Google OAuth not configured. Please set up GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
  console.warn('📖 Setup instructions:');
  console.warn('1. Go to https://console.cloud.google.com/');
  console.warn('2. Create a new project or select existing one');
  console.warn('3. Enable Google+ API');
  console.warn('4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID');
  console.warn('5. Set authorized redirect URI to: http://localhost:3000/api/auth/google/callback');
  console.warn('6. Copy Client ID and Client Secret to your .env file');
}

passport.use(new GoogleStrategy({
  clientID: googleClientId || 'dummy-client-id',
  clientSecret: googleClientSecret || 'dummy-client-secret',
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.avatar = profile.photos[0]?.value;
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0]?.value,
      role: 'user',
      emailVerified: true
    });
    
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/seller', sellerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Backend server is running successfully',
    port: PORT
  });
});

// Test endpoint for frontend connection
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend connection successful!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate field value entered'
    });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// MongoDB connection with improved error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fruitpanda';
    
    // Updated connection options for Mongoose 7+
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Create indexes
    await createIndexes();
    
    // Create default admin user if it doesn't exist
    await createDefaultAdmin();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 MongoDB is not running. Please start MongoDB service:');
      console.error('   - Windows: net start MongoDB');
      console.error('   - macOS/Linux: sudo systemctl start mongod');
      console.error('   - Or start MongoDB manually');
    }
    
    process.exit(1);
  }
};

// Create database indexes for better performance
const createIndexes = async () => {
  try {
    // Only create indexes if they don't exist to avoid duplicate warnings
    const userIndexes = await User.collection.getIndexes();
    
    if (!userIndexes.email_1) {
      await User.collection.createIndex({ email: 1 }, { unique: true });
    }
    
    if (!userIndexes.googleId_1) {
      await User.collection.createIndex({ googleId: 1 }, { sparse: true });
    }
    
    console.log('✅ Database indexes verified');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@fruitpanda.com',
        password: 'admin123',
        role: 'admin',
        emailVerified: true,
        isActive: true
      });
      
      console.log('✅ Default admin user created:');
      console.log('   Email: admin@fruitpanda.com');
      console.log('   Password: admin123');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Port handling with automatic fallback
const findAvailablePort = async (startPort) => {
  const net = await import('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
};

// Start server with port conflict handling
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    
    const availablePort = await findAvailablePort(PORT);
    
    app.listen(availablePort, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${availablePort}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${availablePort}/api`);
      console.log(`🔗 Frontend URL: http://localhost:5173`);
      console.log(`👤 Default Admin: admin@fruitpanda.com / admin123`);
      
      if (availablePort !== PORT) {
        console.log(`⚠️  Port ${PORT} was busy, using port ${availablePort} instead`);
        console.log(`💡 Update your frontend to use: http://localhost:${availablePort}/api`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;