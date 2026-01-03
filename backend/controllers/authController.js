const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/emailService');

// In-memory OTP store for password reset (in production, use Redis or database)
const resetOtpStore = new Map();

// OTP configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

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
    for (const [email, data] of resetOtpStore.entries()) {
        if (data.expiresAt < now) {
            resetOtpStore.delete(email);
        }
    }
}, 60000); // Clean every minute

// @desc    Authenticate a user (Direct login - no OTP)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email/username and password' });
        }

        // Find user by email or username, populate role
        const user = await User.findOne({
            $or: [{ email: email }, { username: email }]
        }).populate('role');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({ message: 'Account is deactivated. Please contact administrator.' });
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
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Request password reset - sends OTP email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user by email
        const user = await User.findOne({ email });

        // Don't reveal if email exists for security, but still return success
        if (!user) {
            return res.json({ 
                success: true, 
                message: 'If your email is registered, you will receive a password reset code.' 
            });
        }

        // Check rate limiting - don't allow requests within 60 seconds
        const existingOTP = resetOtpStore.get(email);
        if (existingOTP) {
            const timeSinceLastSend = Date.now() - (existingOTP.expiresAt - OTP_EXPIRY_MINUTES * 60 * 1000);
            if (timeSinceLastSend < 60000) {
                const waitTime = Math.ceil((60000 - timeSinceLastSend) / 1000);
                return res.status(429).json({ 
                    message: `Please wait ${waitTime} seconds before requesting a new code.`
                });
            }
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);

        // Store OTP
        resetOtpStore.set(email, {
            otp,
            expiresAt,
            userId: user._id,
            username: user.username,
            attempts: 0
        });

        // Send password reset email
        try {
            await sendPasswordResetEmail(email, otp, user.username);
            console.log(`Password reset OTP sent to ${email}`);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            resetOtpStore.delete(email);
            return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
        }

        res.json({ 
            success: true, 
            message: 'Password reset code sent to your email.',
            email: email
        });
    } catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        // Validate password length
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Get stored OTP data
        const otpData = resetOtpStore.get(email);

        if (!otpData) {
            return res.status(400).json({ message: 'Reset code expired or not found. Please request a new one.' });
        }

        // Check if OTP is expired
        if (Date.now() > otpData.expiresAt) {
            resetOtpStore.delete(email);
            return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
        }

        // Increment attempt counter
        otpData.attempts += 1;

        // Check max attempts (5 attempts allowed)
        if (otpData.attempts > 5) {
            resetOtpStore.delete(email);
            return res.status(429).json({ message: 'Too many failed attempts. Please request a new code.' });
        }

        // Verify OTP
        if (otpData.otp !== otp) {
            return res.status(400).json({ 
                message: 'Invalid reset code. Please try again.',
                attemptsRemaining: 5 - otpData.attempts
            });
        }

        // OTP is valid - delete it from store
        resetOtpStore.delete(email);

        // Find and update user's password
        const user = await User.findById(otpData.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        console.log(`Password reset successful for ${email}`);

        res.json({ 
            success: true, 
            message: 'Password has been reset successfully. You can now login with your new password.' 
        });
    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ message: 'Server error during password reset', error: error.message });
    }
};

// @desc    Get user data (Test Endpoint)
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    res.status(200).json(req.user);
};
