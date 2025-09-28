const { getTokenFromHeader, verifyToken } = require('../utils/jwtUtils');
const User = require('../models/userModel');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = getTokenFromHeader(req);
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        
        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token is invalid.'
            });
        }

        // Add user to request object
        req.user = user;
        next();
        
    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Role-based access control middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. ${req.user.role} role is not authorized to access this resource.`
            });
        }

        next();
    };
};

module.exports = {
    protect,
    authorize
};