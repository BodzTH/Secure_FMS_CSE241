const nodemailer = require('nodemailer');

// Create Brevo SMTP transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_KEY
        }
    });
};

// Send Login OTP Email
const sendLoginOTPEmail = async (email, otp, username) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@securefms.com',
            to: email,
            subject: 'Your Secure FMS Login Code',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; text-align: center; }
                        .content { background: white; border-radius: 8px; padding: 30px; margin-top: 20px; }
                        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; display: inline-block; }
                        .logo { color: white; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                        .footer { margin-top: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">🔒 Secure FMS</div>
                        <div class="content">
                            <h2>Hello ${username || 'User'}!</h2>
                            <p>Use the code below to sign in to your account:</p>
                            <div class="otp-code">${otp}</div>
                            <p><strong>This code will expire in 5 minutes.</strong></p>
                            <p>If you didn't request this code, please ignore this email.</p>
                            <div class="footer">
                                <p>&copy; 2026 Secure FMS. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Login OTP email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending login OTP email:', error);
        throw new Error('Failed to send login OTP email: ' + error.message);
    }
};



module.exports = {
    sendLoginOTPEmail
};
