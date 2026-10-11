const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/register', authController.register);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/forgot-password-otp', authController.forgotPasswordSendOtp);
router.post('/reset-password-otp', authController.resetPasswordWithOtp);
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
