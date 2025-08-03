import passport from 'passport';

// Middleware to require authentication
export const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Authentication error', error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: info?.message || 'Invalid or missing token'
      });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware to require specific roles
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole(['admin']);

// Middleware to check if user is seller or admin
export const requireSeller = requireRole(['seller', 'admin']);

// Optional authentication (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};