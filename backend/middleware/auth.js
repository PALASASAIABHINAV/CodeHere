import jwt from 'jsonwebtoken';



// Middleware to verify JWT token from cookie
export const verifyToken = (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user id to request object
    req.userId = decoded.userId;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Token verification error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};

// Optional middleware to check if user is authenticated (doesn't block request)
export const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    // Get user from database to check role
    const result = await import('../config/db.js').then(module =>
      module.default.query('SELECT role FROM users WHERE id = $1', [req.userId])
    );

    if (!result.rows[0] || result.rows[0].role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization',
    });
  }
};

export const requirePrimeProfilePicture = async (req, res, next) => {
  const user = await User.getById(req.userId);
  if (user.is_prime && !user.profile_picture_url) {
    return res.status(403).json({
      success: false,
      message: 'Prime users must upload a profile picture',
      requiresProfilePicture: true
    });
  }
  next();
};