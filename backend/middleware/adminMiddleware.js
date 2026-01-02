const adminOnly = (req, res, next) => {
    console.log('adminOnly middleware check:');
    console.log('User ID:', req.user?._id);
    console.log('Role Object:', req.user?.role);
    console.log('Role Name:', req.user?.role?.role_name);

    if (req.user && req.user.role && (req.user.role.role_name === 'superadmin' || req.user.role.role_name === 'admin')) {
        next();
    } else {
        console.log('Access denied by adminOnly middleware');
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

module.exports = { adminOnly };
