const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/retailer', roleMiddleware('RETAILER', 'ADMIN'), analyticsController.getRetailerStats);
router.get('/admin', roleMiddleware('ADMIN'), analyticsController.getAdminStats);

module.exports = router;
