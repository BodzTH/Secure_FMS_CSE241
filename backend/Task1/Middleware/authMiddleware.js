const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserRole = require('../models/UserRole');

// Protect routes - Verify JWT and load user with role and permissions
const protect = async (req, res, next) => {
    try {
        let token;

        // Check if Authorization header exists and starts with 'Bearer'
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({ 
                error: 'Not authorized, no token provided' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token (exclude password)
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ 
                error: 'Not authorized, user not found' 
            });
        }

        // Get user role and permissions
        const userRoleAssignment = await UserRole.findOne({ userId: user._id }).populate('roleId');

        if (!userRoleAssignment) {
            return res.status(403).json({ 
                error: 'User role not assigned' 
            });
        }

        // Attach user with role and permissions to request
        req.user = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: userRoleAssignment.roleId.name,
            permissions: userRoleAssignment.roleId.permissions
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Not authorized, invalid token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Not authorized, token expired' 
            });
        }

        res.status(500).json({ 
            error: 'Server error in authentication',
            details: error.message 
        });
    }
};

module.exports = { protect };
