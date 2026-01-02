const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Input validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ 
                error: 'All fields are required',
                required: ['firstName', 'lastName', 'email', 'password']
            });
        }
        
        // Validate password length (minimum 8 characters)
        if (password.length < 8) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters' 
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(409).json({ 
                error: 'Email already registered' 
            });
        }
        
        // Create new user (password will be hashed automatically by pre-save middleware)
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password
        });
        
        // Find default "user" role
        const userRole = await Role.findOne({ name: 'user' });
        
        if (!userRole) {
            return res.status(500).json({ 
                error: 'Default user role not found. Please run: node scripts/seedRoles.js' 
            });
        }

        // Assign default role to user
        await UserRole.create({
            userId: newUser._id,
            roleId: userRole._id
        });
        
        // Generate JWT token
        const token = generateToken(newUser._id);
        
        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: userRole.name
            }
        });
        
    } catch (error) {
        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({ 
                error: 'Email already registered' 
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                error: 'Validation failed',
                details: messages
            });
        }
        
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }
        
        // Verify password using the matchPassword method
        const isValidPassword = await user.matchPassword(password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Invalid email or password'
            });
        }
        
        // Get user role and permissions
        const userRoleAssignment = await UserRole.findOne({ userId: user._id }).populate('roleId');
        
        if (!userRoleAssignment) {
            return res.status(500).json({ 
                error: 'User role not found. Please run: node scripts/seedRoles.js' 
            });
        }
        
        // Generate JWT token
        const token = generateToken(user._id);
        
        res.status(200).json({ 
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: userRoleAssignment.roleId.name,
                permissions: userRoleAssignment.roleId.permissions
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
};
