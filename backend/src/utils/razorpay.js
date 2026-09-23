const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_necstore12345';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'necstore_razorpay_secret_key_98765';

const razorpayInstance = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

const verifySignature = (orderId, paymentId, signature) => {
  if (!orderId || !paymentId || !signature) return false;
  // If running mock verification in test mode
  if (process.env.DEMO_MODE === 'true' && signature.startsWith('mock_sig_')) {
    return true;
  }
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  razorpayInstance,
  verifySignature
};
