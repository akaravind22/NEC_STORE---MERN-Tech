const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public product routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

// Protected Retailer & Admin routes
router.post('/', authMiddleware, roleMiddleware('RETAILER', 'ADMIN'), productController.createProduct);
router.put('/:id', authMiddleware, roleMiddleware('RETAILER', 'ADMIN'), productController.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('RETAILER', 'ADMIN'), productController.deleteProduct);

module.exports = router;
