const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('RETAILER', 'ADMIN'));

router.get('/sales', reportController.downloadSalesReport);
router.get('/stock', reportController.downloadStockReport);
router.get('/stock-history', reportController.downloadStockHistoryReport);
router.get('/incoming-stock', reportController.downloadStockHistoryReport);
router.get('/transactions', reportController.downloadTransactionsReport);

module.exports = router;
