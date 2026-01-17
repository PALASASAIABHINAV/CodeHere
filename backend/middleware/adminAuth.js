// middleware/adminAuth.js
import User from '../models/User.js';

export const verifyAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get user and check admin role
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin verification',
    });
  }
};