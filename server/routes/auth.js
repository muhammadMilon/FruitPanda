import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import { generateToken } from '../utils/auth.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Local Register
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role = 'user' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: ['user', 'seller'].includes(role) ? role : 'user'
    });

    // Generate JWT token
    const token = generateToken(user.getAuthTokenPayload());

    // Update last login
    await user.updateLastLogin();

    // Send welcome email (optional)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Fruit Panda!',
        template: 'welcome',
        data: { name: user.name }
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
});

// Local Login
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account has been deactivated. Please contact support.' 
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = generateToken(user.getAuthTokenPayload());

    // Update last login
    await user.updateLastLogin();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
});

// Google OAuth initiate
router.get('/google', (req, res, next) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!googleClientId || !googleClientSecret || googleClientId === 'your-google-client-id') {
    return res.status(503).json({
      message: 'Google OAuth is not configured',
      error: 'Please set up Google OAuth credentials in the server environment variables',
      setupInstructions: [
        '1. Go to https://console.cloud.google.com/',
        '2. Create a new project or select existing one',
        '3. Enable Google+ API',
        '4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID',
        '5. Set authorized redirect URI to: http://localhost:3000/api/auth/google/callback',
        '6. Copy Client ID and Client Secret to your .env file'
      ]
    });
  }
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`,
    session: false
  }),
  async (req, res) => {
    try {
      const user = req.user;
      
      // Generate JWT token
      const token = generateToken(user.getAuthTokenPayload());
      
      // Update last login
      await user.updateLastLogin();
      
      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_callback_failed`);
    }
  }
);

// Verify Token
router.get('/verify', 
  passport.authenticate('jwt', { session: false }), 
  (req, res) => {
    res.json({
      message: 'Token is valid',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        emailVerified: req.user.emailVerified,
        lastLogin: req.user.lastLogin
      }
    });
  }
);

// Refresh Token
router.post('/refresh', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    try {
      const user = req.user;
      
      // Generate new token
      const token = generateToken(user.getAuthTokenPayload());
      
      res.json({
        message: 'Token refreshed successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ 
        message: 'Error refreshing token', 
        error: error.message 
      });
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  // Since we're using JWT, logout is handled on the client side
  // But we can add token blacklisting here if needed
  res.json({ message: 'Logged out successfully' });
});

// Password Reset Request
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - Fruit Panda',
        template: 'password-reset',
        data: { 
          name: user.name,
          resetUrl,
          expiresIn: '1 hour'
        }
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({ 
        message: 'Error sending password reset email' 
      });
    }

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      message: 'Error processing password reset request', 
      error: error.message 
    });
  }
});

// Password Reset
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      _id: decoded.userId,
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ 
      message: 'Password reset successful. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'Error resetting password', 
      error: error.message 
    });
  }
});

export default router;