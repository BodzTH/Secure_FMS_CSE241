const User = require('../models/User');
const Role = require('../models/Role');
const File = require('../models/File');
const bcrypt = require('bcrypt');

// @desc    Create a new user (Admin)
// @route   POST /api/admin/create-user
// @access  Admin/Superadmin
const createUser = async (req, res) => {
    console.log('createUser payload:', req.body);
    const { username, password, role_name } = req.body;

    if (!username || !password || !role_name) {
        console.log('createUser failed: Missing fields', req.body);
        return res.status(400).json({ message: 'Please provide username, password, and role_name' });
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailToValidate = req.body.email || `${username}@placeholder.com`; // Validate provided email or fallback (though fallback is usually safe, good practice)
    
    if (req.body.email && !emailRegex.test(req.body.email)) {
         console.log('createUser failed: Invalid email format', req.body.email);
         return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password Validation
    // Min 8 chars, at least one number, at least one special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
        console.log('createUser failed: Weak password');
        return res.status(400).json({ 
            message: 'Password must be at least 8 characters long and contain at least one number and one special character (!@#$%^&*)' 
        });
    }

    try {
        // Scope check: Admin can strictly only create 'user' role
        if (req.user.role.role_name === 'admin' && role_name !== 'user') {
            console.log('createUser failed: Admin tried to create non-user role', role_name);
            return res.status(403).json({ message: 'Access denied: You can only create a User' });
        }

        const role = await Role.findOne({ role_name });
        if (!role) {
            console.log('createUser failed: Invalid role', role_name);
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            console.log('createUser failed: User already exists', username);
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = await User.create({
            username,
            email: req.body.email || `${username}@placeholder.com`, // Use provided email or fallback to placeholder
            password, // Pass plain password, pre-save hook will hash it
            role: role._id, // Assign Single Role PK
            is_active: true,
            created_by: req.user._id // Track who created this user
        });

        res.status(201).json({ message: 'User created successfully', userId: newUser._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user
// @route   PATCH /api/admin/update-user/:id
// @access  Admin/Superadmin
const updateUser = async (req, res) => {
    console.log('updateUser payload:', req.body);
    const { username, email, role_name, is_active } = req.body;
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Scope check: If admin, can only update if they created it
        if (req.user.role.role_name === 'admin' && user.created_by?.toString() !== req.user._id.toString()) {
             return res.status(403).json({ message: 'Access denied: You can only update users you created' });
        }

        if (username) user.username = username;
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            user.email = email;
        }
        if (is_active !== undefined) user.is_active = is_active;
        
        if (role_name) {
            // Scope check: Admin can strictly only assign 'user' role
            if (req.user.role.role_name === 'admin' && role_name !== 'user') {
                return res.status(403).json({ message: 'Access denied: You can only assign the User role' });
            }

            const role = await Role.findOne({ role_name });
            if (!role) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            user.role = role._id;
        }

        // Save triggers pre-save hooks (rehashing password check, role integrity check)
        await user.save();

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/delete-user/:id
// @access  Admin/Superadmin
const deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Scope check: If admin, can only delete if they created it
        if (req.user.role.role_name === 'admin' && user.created_by?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied: You can only delete users you created' });
        }

        // Optional: delete all files of this user
        await File.deleteMany({ owner_id: user._id });

        await User.deleteOne({ _id: userId });

        res.json({ message: 'User and associated files deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    List all users
// @route   GET /api/admin/users
// @access  Admin/Superadmin
const listUsers = async (req, res) => {
    try {
        let query = {};
        
        // If not superadmin (i.e. admin), only show users created by them
        if (req.user.role.role_name !== 'superadmin') {
            query = { created_by: req.user._id };
        }

        const users = await User.find(query).select('-password').populate('role', 'role_name description').populate('created_by', 'username');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createUser,
    updateUser,
    deleteUser,
    listUsers
};
