import nodemailer from 'nodemailer';

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send email verification code
export const sendEmailVerification = async (email, code, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@assetflow.bg',
      to: email,
      subject: 'AssetFlow - Account Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AssetFlow, ${name}!</h2>
          <p>Your account has been created. To complete your registration, please use the verification code below:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`Email verification sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return false;
  }
};

// Send SMS verification code (mock implementation)
export const sendSMSVerification = async (phone, code, name) => {
  try {
    // Mock SMS sending - in production, integrate with SMS provider like Twilio
    console.log(`SMS to ${phone}: AssetFlow verification code: ${code}`);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    return false;
  }
};