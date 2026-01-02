// Check if user has required permission
const hasPermission = (requiredPermission) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Not authenticated' 
            });
        }

        // Check if user has the required permission
        if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
            return res.status(403).json({ 
                error: 'Access denied',
                message: `You do not have permission: ${requiredPermission}`,
                yourPermissions: req.user.permissions || []
            });
        }

        next();
    };
};

module.exports = { hasPermission };
