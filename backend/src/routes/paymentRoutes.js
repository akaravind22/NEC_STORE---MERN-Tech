const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/create-order', paymentController.createRazorpayOrder);
router.post('/verify', paymentController.verifyRazorpayPayment);

module.exports = router;
