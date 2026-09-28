const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public product routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/template', productController.downloadTemplate);
router.get('/:id', productController.getProductById);

// Protected Retailer & Admin routes
router.post('/bulk-import', authMiddleware, roleMiddleware('RETAILER', 'ADMIN'), productController.bulkImportProducts);
router.post('/', authMiddleware, roleMiddleware('RETAILER', 'ADMIN'), productController.createProduct);
router.put('/:id', authMiddleware, roleMiddleware('RETAILER', 'ADMIN'), productController.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('RETAILER', 'ADMIN'), productController.deleteProduct);

module.exports = router;
