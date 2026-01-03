const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendLoginOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');

// In-memory OTP stores (in production, use Redis or database)
const loginOtpStore = new Map();
const resetOtpStore = new Map();

// OTP configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const RESET_OTP_EXPIRY_MINUTES = 10;

// Generate a secure random OTP
const generateOTP = () => {
    const digits = '0123456789';
    let otp = '';
    const randomBytes = crypto.randomBytes(OTP_LENGTH);
    for (let i = 0; i < OTP_LENGTH; i++) {
        otp += digits[randomBytes[i] % 10];
    }
    return otp;
};

// Clean up expired OTPs periodically
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of loginOtpStore.entries()) {
        if (data.expiresAt < now) {
            loginOtpStore.delete(email);
        }
    }
    for (const [email, data] of resetOtpStore.entries()) {
        if (data.expiresAt < now) {
            resetOtpStore.delete(email);
        }
    }
}, 60000);

// @desc    Request login OTP (Step 1: Email only, no password)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [{ email: email }, { username: email }]
        }).populate('role');

        if (!user) {
            return res.status(401).json({ message: 'No account found with this email' });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({ message: 'Account is deactivated. Please contact administrator.' });
        }

        // Rate limiting - don't allow requests within 30 seconds
        const existingOTP = loginOtpStore.get(user.email);
        if (existingOTP) {
            const timeSinceLastSend = Date.now() - (existingOTP.expiresAt - OTP_EXPIRY_MINUTES * 60 * 1000);
            if (timeSinceLastSend < 30000) {
                const waitTime = Math.ceil((30000 - timeSinceLastSend) / 1000);
                return res.status(429).json({ 
                    message: `Please wait ${waitTime} seconds before requesting a new code.`
                });
            }
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);

        // Store OTP
        loginOtpStore.set(user.email, {
            otp,
            expiresAt,
            userId: user._id,
            username: user.username,
            attempts: 0
        });

        // Send OTP email
        try {
            await sendLoginOTPEmail(user.email, otp, user.username);
            console.log(`Login OTP sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send login OTP:', emailError);
            loginOtpStore.delete(user.email);
            return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
        }

        res.json({
            otpRequired: true,
            email: user.email,
            message: 'Verification code sent to your email'
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Verify login OTP and authenticate
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Get stored OTP data
        const otpData = loginOtpStore.get(email);

        if (!otpData) {
            return res.status(400).json({ message: 'Code expired or not found. Please request a new one.' });
        }

        // Check if OTP is expired
        if (Date.now() > otpData.expiresAt) {
            loginOtpStore.delete(email);
            return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
        }

        // Increment attempt counter
        otpData.attempts += 1;

        // Check max attempts (5 attempts allowed)
        if (otpData.attempts > 5) {
            loginOtpStore.delete(email);
            return res.status(429).json({ message: 'Too many failed attempts. Please request a new code.' });
        }

        // Verify OTP
        if (otpData.otp !== otp) {
            return res.status(400).json({ 
                message: 'Invalid code. Please try again.',
                attemptsRemaining: 5 - otpData.attempts
            });
        }

        // OTP is valid - delete it from store
        loginOtpStore.delete(email);

        // Get user for token generation
        const user = await User.findById(otpData.userId).populate('role');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate JWT
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role.role_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error.message);
        res.status(500).json({ message: 'Server error during verification', error: error.message });
    }
};

// @desc    Resend login OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user
        const user = await User.findOne({ email }).populate('role');
        
        if (!user) {
            return res.json({ message: 'If your email is registered, you will receive a new code.' });
        }

        // Rate limiting
        const existingOTP = loginOtpStore.get(email);
        if (existingOTP) {
            const timeSinceLastSend = Date.now() - (existingOTP.expiresAt - OTP_EXPIRY_MINUTES * 60 * 1000);
            if (timeSinceLastSend < 30000) {
                const waitTime = Math.ceil((30000 - timeSinceLastSend) / 1000);
                return res.status(429).json({ 
                    message: `Please wait ${waitTime} seconds before requesting a new code.`
                });
            }
        }

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);

        loginOtpStore.set(email, {
            otp,
            expiresAt,
            userId: user._id,
            username: user.username,
            attempts: 0
        });

        try {
            await sendLoginOTPEmail(email, otp, user.username);
            console.log(`Login OTP resent to ${email}`);
        } catch (emailError) {
            console.error('Failed to resend OTP:', emailError);
            return res.status(500).json({ message: 'Failed to send email. Please try again.' });
        }

        res.json({ message: 'A new code has been sent to your email.' });
    } catch (error) {
        console.error('Resend OTP error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    res.status(200).json(req.user);
};
