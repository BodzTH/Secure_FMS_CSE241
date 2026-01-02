const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    // Frontend sends 'email' or 'username' but auth.service sends first arg as 'email' property
    // To support both, we check if 'email' from body is actually a username or email.
    // Or we accept an 'identifier' field.
    // Given the current mismatch, the frontend sends { email: "superadmin" } if user types superadmin.
    // So we treat req.body.email as "identifier".
    
    // We destruct 'email' but treat it as identifier, or check 'username' too if sent.
    const { email, username, password } = req.body;
    const identifier = email || username;

    try {
        // Check for user by email OR username
        const user = await User.findOne({ 
            $or: [{ email: identifier }, { username: identifier }] 
        }).populate('role');

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role.role_name,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data (Test Endpoint)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

module.exports = {
    loginUser,
    getMe,
};
