const nodemailer = require('nodemailer');

// Create Brevo SMTP transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_KEY
        }
    });
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, otp, username) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@securefms.com',
            to: email,
            subject: 'Reset Your Secure FMS Password',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                            border-radius: 10px;
                            padding: 30px;
                            text-align: center;
                        }
                        .content {
                            background: white;
                            border-radius: 8px;
                            padding: 30px;
                            margin-top: 20px;
                        }
                        .otp-code {
                            font-size: 36px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            color: #f5576c;
                            background: #fff0f3;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            display: inline-block;
                        }
                        .logo {
                            color: white;
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .warning {
                            background: #fff3cd;
                            border: 1px solid #ffc107;
                            border-radius: 8px;
                            padding: 15px;
                            margin: 20px 0;
                            font-size: 14px;
                            color: #856404;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">🔐 Secure FMS</div>
                        <div class="content">
                            <h2>Password Reset Request</h2>
                            <p>Hello ${username || 'User'},</p>
                            <p>We received a request to reset your password for your Secure File Management System account.</p>
                            <p>Your password reset code is:</p>
                            <div class="otp-code">${otp}</div>
                            <p><strong>This code will expire in 10 minutes.</strong></p>
                            <div class="warning">
                                ⚠️ If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                            </div>
                            <div class="footer">
                                <p>This is an automated message, please do not reply.</p>
                                <p>&copy; 2026 Secure FMS. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent via Brevo:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email: ' + error.message);
    }
};

// Verify transporter connection (useful for testing)
const verifyConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('SMTP connection verified successfully');
        return true;
    } catch (error) {
        console.error('SMTP connection verification failed:', error);
        return false;
    }
};

module.exports = {
    sendPasswordResetEmail,
    verifyConnection
};
