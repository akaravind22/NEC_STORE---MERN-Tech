const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const chatbotController = require('../controllers/chatbotController');

// Optional Authentication Middleware:
// If token is provided, attach req.user so chatbot knows role (Customer, Retailer, Admin).
// If no token (guest visitor), proceed with req.user = null (Customer/Guest behavior).
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nec_store_super_secret_jwt_key_2026_college_app');
      const user = await User.findByPk(decoded.userId);
      if (user && user.status !== 'SUSPENDED') {
        req.user = user;
      }
    }
  } catch (err) {
    // Guest visitor - ignore error
  }
  next();
};

router.post('/message', optionalAuth, chatbotController.handleChatMessage);

module.exports = router;
