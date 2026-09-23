const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"NEC Store" <${process.env.EMAIL_USER || 'no-reply@necstore.com'}>`,
    to: email,
    subject: 'NEC Store - Login Verification Code (OTP)',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #38bdf8; margin: 0; font-size: 24px;">NEC STORE</h2>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">College Store & Inventory Management System</p>
        </div>
        <div style="background: rgba(30, 41, 59, 0.8); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(56, 189, 248, 0.2);">
          <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 16px;">Your 6-digit one-time login code is:</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; margin: 12px 0;">${otp}</div>
          <p style="font-size: 12px; color: #64748b; margin-top: 16px;">This OTP will expire in 5 minutes. Do not share it with anyone.</p>
        </div>
      </div>
    `
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== 'demo@necstore.com') {
      await transporter.sendMail(mailOptions);
      console.log(`[Mailer] Real OTP email sent to ${email}`);
    } else {
      console.log(`\n========================================`);
      console.log(`[DEMO MAILER] Destination: ${email}`);
      console.log(`[DEMO MAILER] Verification OTP: [ ${otp} ]`);
      console.log(`========================================\n`);
    }
    return true;
  } catch (error) {
    console.error('[Mailer Error] Failed to send email via SMTP. Falling back to log verification:', error.message);
    console.log(`[DEMO FALLBACK OTP] ${email} -> ${otp}`);
    return true;
  }
};

module.exports = {
  sendOTPEmail
};
