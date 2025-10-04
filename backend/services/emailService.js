const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (email, otp, type) => {
  const subject = type === 'signup' ? 'Verify Your Email - Expense Manager' : 'Reset Your Password - Expense Manager';
  const title = type === 'signup' ? 'Email Verification' : 'Password Reset';
  const message = type === 'signup' 
    ? 'Please use the following OTP to verify your email address and complete your registration:'
    : 'Please use the following OTP to reset your password:';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">Expense Manager</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">${title}</h2>
          <p style="color: #64748b; margin-bottom: 30px; line-height: 1.6;">
            ${message}
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 8px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">
            This OTP will expire in 5 minutes.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
          <p>If you didn't request this, please ignore this email.</p>
          <p>© 2024 Expense Manager. Powered by Infinite Loopers.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendOTPEmail
};