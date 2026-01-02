const User = require('../models/User');
const Role = require('../models/Role');
const File = require('../models/File');
const bcrypt = require('bcrypt');

// @desc    Create a new user (Admin)
// @route   POST /api/admin/create-user
// @access  Admin/Superadmin
const createUser = async (req, res) => {
    const { username, password, role_name } = req.body;

    if (!username || !password || !role_name) {
        return res.status(400).json({ message: 'Please provide username, password, and role_name' });
    }

    try {
        const role = await Role.findOne({ role_name });
        if (!role) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email: `${username}@placeholder.com`, // Requirement didn't ask for email in admin create, generating placeholder to satisfy schema unique constraint
            password: hashedPassword,
            role: role._id, // Assign Single Role PK
            is_active: true
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
    const { username, role_name, is_active } = req.body;
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username) user.username = username;
        if (is_active !== undefined) user.is_active = is_active;
        
        if (role_name) {
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
        const users = await User.find().select('-password').populate('role', 'role_name description');
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
