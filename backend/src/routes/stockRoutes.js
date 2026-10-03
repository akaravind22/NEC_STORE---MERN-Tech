const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/add', roleMiddleware('RETAILER', 'ADMIN'), stockController.addStock);
router.get('/history', roleMiddleware('RETAILER', 'ADMIN'), stockController.getStockHistory);
router.get('/purchases', roleMiddleware('RETAILER', 'ADMIN'), stockController.getPurchaseTransactions);

module.exports = router;
