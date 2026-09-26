const express = require('express');
const router = express.Router();
const storeSettingController = require('../controllers/storeSettingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public route to view store hours and live status
router.get('/', storeSettingController.getStoreSettings);

// Protected routes for Retailer and Admin to configure timings and status
router.put('/', authMiddleware, roleMiddleware('RETAILER', 'ADMIN'), storeSettingController.updateStoreSettings);
router.post('/quick-status', authMiddleware, roleMiddleware('RETAILER', 'ADMIN'), storeSettingController.quickStatusUpdate);

module.exports = router;
