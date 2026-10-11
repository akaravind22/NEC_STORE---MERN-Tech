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

const sendPasswordResetEmail = async (email, otp) => {
  const mailOptions = {
    from: `"NEC Store Support" <${process.env.EMAIL_USER || 'no-reply@necstore.com'}>`,
    to: email,
    subject: 'NEC Store - Password Reset OTP Code',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #6366f1; margin: 0; font-size: 24px;">NEC STORE</h2>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Password Reset Verification</p>
        </div>
        <div style="background: rgba(30, 41, 59, 0.8); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(99, 102, 241, 0.3);">
          <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 12px;">You requested to reset your password. Use the 6-digit OTP verification code below:</p>
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #818cf8; margin: 16px 0; background: rgba(99, 102, 241, 0.1); padding: 12px; border-radius: 8px;">${otp}</div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">This OTP code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
      </div>
    `
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== 'demo@necstore.com') {
      await transporter.sendMail(mailOptions);
      console.log(`[Mailer] Password reset OTP sent to ${email}`);
    } else {
      console.log(`\n========================================`);
      console.log(`[DEMO MAILER] Password Reset OTP for: ${email}`);
      console.log(`[DEMO MAILER] Reset OTP: [ ${otp} ]`);
      console.log(`========================================\n`);
    }
    return true;
  } catch (error) {
    console.error('[Mailer Error] Failed to send reset email:', error.message);
    return true;
  }
};

const sendPaymentSuccessEmail = async (email, { order, user, paymentMethod, razorpayPaymentId, calculatedTotal, items }) => {
  const orderId = order.id || 'N/A';
  const customerName = user.name || 'Student / Customer';
  const totalStr = parseFloat(calculatedTotal || order.totalAmount || 0).toFixed(2);
  const paymentMode = paymentMethod === 'COD' ? 'Cash on Counter Pickup' : 'Online Payment (Razorpay)';
  const paymentRef = razorpayPaymentId || order.razorpayPaymentId || `COD-REC-${orderId}`;
  const dateFormatted = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  // Generate item rows
  const itemsList = items || (order.items && order.items.map(it => ({
    name: it.Product?.name || it.productName || 'Store Item',
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    subtotal: it.subtotal
  }))) || [];

  const itemsHtml = itemsList.map(it => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
      <td style="padding: 10px 8px; color: #f1f5f9; font-size: 13px; font-weight: 600;">${it.name || it.Product?.name || 'Item'}</td>
      <td style="padding: 10px 8px; text-align: center; color: #94a3b8; font-size: 13px;">${it.quantity}</td>
      <td style="padding: 10px 8px; text-align: right; color: #94a3b8; font-size: 13px;">₹${parseFloat(it.unitPrice).toFixed(2)}</td>
      <td style="padding: 10px 8px; text-align: right; color: #38bdf8; font-size: 13px; font-weight: 700;">₹${parseFloat(it.subtotal).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"NEC Campus Store" <${process.env.EMAIL_USER || 'no-reply@necstore.com'}>`,
    to: email,
    subject: `Payment Successful & Order Confirmed - Order #${orderId} [NEC Store]`,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4f46e5 100%); padding: 32px 24px; text-align: center;">
          <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 999px; font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #ffffff; text-transform: uppercase; margin-bottom: 12px;">
            ✓ Payment Successful
          </div>
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">NEC STORE</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #bfdbfe;">National Engineering College • Campus Store</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 24px;">
          
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 18px; color: #f1f5f9; margin: 0 0 6px 0;">Hello ${customerName},</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">
              Thank you for your order! Your payment has been received and your order is confirmed.
            </p>
          </div>

          <!-- Order Summary Card -->
          <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Order ID</span>
                <strong style="color: #38bdf8; font-size: 15px;">#${orderId}</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Date & Time</span>
                <strong style="color: #e2e8f0;">${dateFormatted}</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Payment Mode</span>
                <strong style="color: #e2e8f0;">${paymentMode}</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Transaction Ref</span>
                <strong style="color: #10b981; font-family: monospace; font-size: 12px;">${paymentRef}</strong>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <h3 style="font-size: 14px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">
            Items Ordered
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.15); color: #64748b; font-size: 11px; text-transform: uppercase;">
                <th style="padding: 8px; text-align: left;">Product</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Total Section -->
          <div style="border-top: 2px solid rgba(56, 189, 248, 0.3); padding-top: 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <span style="font-size: 15px; font-weight: 700; color: #f8fafc;">Total Paid:</span>
            <span style="font-size: 22px; font-weight: 800; color: #10b981;">₹${totalStr}</span>
          </div>

          <!-- Pickup Counter Notice Box -->
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 13px; font-weight: 700; color: #34d399; margin-bottom: 4px;">
              📦 Store Pickup Instructions
            </div>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
              Please present this email or your <strong>Order ID #${orderId}</strong> at the <strong>NEC Campus Store Counter</strong> during open store hours to collect your items.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255,255,255,0.08); padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">National Engineering College Store • Automated Notification</p>
          <p style="margin: 4px 0 0 0; font-size: 11px;">If you have any questions regarding your order, please contact the campus store desk.</p>
        </div>

      </div>
    `
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== 'demo@necstore.com') {
      await transporter.sendMail(mailOptions);
      console.log(`[Mailer] Order confirmation & payment success email sent to ${email} for Order #${orderId}`);
    } else {
      console.log(`\n========================================`);
      console.log(`[DEMO MAILER] Payment Success Email for: ${email}`);
      console.log(`[DEMO MAILER] Order #${orderId} | Total: ₹${totalStr}`);
      console.log(`========================================\n`);
    }
    return true;
  } catch (error) {
    console.error('[Mailer Error] Failed to send payment success email:', error.message);
    return false;
  }
};


const sendOrderCancellationEmail = async (email, { order, user, reason }) => {
  const orderId = order.id || 'N/A';
  const customerName = user?.name || 'Student / Customer';
  const totalStr = parseFloat(order.totalAmount || 0).toFixed(2);
  const isOnlinePayment = order.paymentStatus === 'PAID' || order.razorpayPaymentId;

  const mailOptions = {
    from: `"NEC Campus Store" <${process.env.EMAIL_USER || 'no-reply@necstore.com'}>`,
    to: email,
    subject: `Order Cancelled - Order #${orderId} [NEC Store]`,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%); padding: 30px 24px; text-align: center;">
          <div style="display: inline-block; background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #fecaca; text-transform: uppercase; margin-bottom: 10px;">
            Order Cancellation Notice
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">NEC STORE</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #fca5a5;">National Engineering College • Campus Store</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 24px;">
          
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 18px; color: #f1f5f9; margin: 0 0 6px 0;">Hello ${customerName},</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">
              Your order <strong style="color: #f87171;">#${orderId}</strong> totaling <strong>₹${totalStr}</strong> has been cancelled successfully.
            </p>
          </div>

          <!-- Cancellation Details Card -->
          <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Order ID</span>
                <strong style="color: #f87171; font-size: 15px;">#${orderId}</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Status</span>
                <strong style="color: #ef4444;">CANCELLED</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Order Total</span>
                <strong style="color: #e2e8f0;">₹${totalStr}</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Inventory</span>
                <strong style="color: #10b981;">Stock Restored</strong>
              </div>
            </div>
          </div>

          <!-- Refund / Payment Info -->
          <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin-bottom: 4px;">
              💳 Payment & Refund Information
            </div>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
              ${isOnlinePayment 
                ? 'If you completed online payment via Razorpay, your refund will be processed back to your original source account within 3 to 5 working days.' 
                : 'Since this order was set for Cash on Counter Pickup, no charges were deducted from your account.'}
            </p>
          </div>

          <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
            You are always welcome to place a new order anytime on the <a href="http://localhost:5173" style="color: #38bdf8; text-decoration: none; font-weight: 600;">NEC Campus Store Portal</a>.
          </p>

        </div>

        <!-- Footer -->
        <div style="background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255,255,255,0.08); padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">National Engineering College Store • Automated Notification</p>
        </div>

      </div>
    `
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== 'demo@necstore.com') {
      await transporter.sendMail(mailOptions);
      console.log(`[Mailer] Order cancellation email sent to ${email} for Order #${orderId}`);
    } else {
      console.log(`\n========================================`);
      console.log(`[DEMO MAILER] Order Cancellation Email for: ${email}`);
      console.log(`[DEMO MAILER] Order #${orderId} Cancelled`);
      console.log(`========================================\n`);
    }
    return true;
  } catch (error) {
    console.error('[Mailer Error] Failed to send order cancellation email:', error.message);
    return false;
  }
};


const sendOrderDeliveredEmail = async (email, { order, user }) => {
  const orderId = order.id || 'N/A';
  const customerName = user?.name || 'Student / Customer';
  const totalStr = parseFloat(order.totalAmount || 0).toFixed(2);
  const deliveryTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  const mailOptions = {
    from: `"NEC Campus Store" <${process.env.EMAIL_USER || 'no-reply@necstore.com'}>`,
    to: email,
    subject: `Order Received & Delivered - Order #${orderId} [NEC Store]`,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%); padding: 32px 24px; text-align: center;">
          <div style="display: inline-block; background: rgba(0,0,0,0.25); padding: 6px 16px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #a7f3d0; text-transform: uppercase; margin-bottom: 12px;">
            ✓ Items Handed Over & Collected
          </div>
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff;">NEC STORE</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #d1fae5;">National Engineering College • Campus Store</p>
        </div>

        <!-- Body -->
        <div style="padding: 28px 24px;">
          
          <div style="margin-bottom: 22px;">
            <h2 style="font-size: 18px; color: #f1f5f9; margin: 0 0 6px 0;">Hello ${customerName},</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">
              Your order <strong style="color: #34d399;">#${orderId}</strong> has been successfully handed over to you at the <strong>NEC Campus Store Counter</strong>.
            </p>
          </div>

          <!-- Delivery Confirmation Card -->
          <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 18px; margin-bottom: 24px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px;">
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Order ID</span>
                <strong style="color: #38bdf8; font-size: 15px;">#${orderId}</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Delivery Status</span>
                <strong style="color: #10b981; font-size: 14px;">DELIVERED / RECEIVED</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Handover Time</span>
                <strong style="color: #e2e8f0;">${deliveryTime}</strong>
              </div>
              <div>
                <span style="color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700;">Total Paid</span>
                <strong style="color: #10b981; font-size: 14px;">₹${totalStr}</strong>
              </div>
            </div>
          </div>

          <!-- Successful Pickup Message Box -->
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 14px; font-weight: 700; color: #34d399; margin-bottom: 4px;">
              ✨ Thank You for Shopping with NEC Store!
            </div>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
              We hope your materials serve you well. If you encounter any defects or issues with the items, please report to the counter staff within 24 hours.
            </p>
          </div>

          <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5; text-align: center;">
            Need more supplies? Visit the <a href="http://localhost:5173" style="color: #38bdf8; text-decoration: none; font-weight: 600;">NEC Campus Store Portal</a> anytime.
          </p>

        </div>

        <!-- Footer -->
        <div style="background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255,255,255,0.08); padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">National Engineering College Store • Automated Delivery Receipt</p>
        </div>

      </div>
    `
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_USER !== 'demo@necstore.com') {
      await transporter.sendMail(mailOptions);
      console.log(`[Mailer] Order delivered receipt email sent to ${email} for Order #${orderId}`);
    } else {
      console.log(`\n========================================`);
      console.log(`[DEMO MAILER] Order Delivered Email for: ${email}`);
      console.log(`[DEMO MAILER] Order #${orderId} Handover Completed`);
      console.log(`========================================\n`);
    }
    return true;
  } catch (error) {
    console.error('[Mailer Error] Failed to send order delivered email:', error.message);
    return false;
  }
};

module.exports = {
  sendOrderDeliveredEmail,
  sendOrderCancellationEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendPaymentSuccessEmail
};
