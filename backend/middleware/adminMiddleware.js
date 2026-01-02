const adminOnly = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.role_name === 'superadmin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a superadmin' });
    }
};

module.exports = { adminOnly };
