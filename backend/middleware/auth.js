const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided, access denied' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token is not valid, user not found' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token has expired' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error during authentication' 
        });
    }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Access denied. Admin privileges required.' 
        });
    }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            const user = await User.findById(decoded.id);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

module.exports = {
    authenticate,
    isAdmin,
    optionalAuth
};