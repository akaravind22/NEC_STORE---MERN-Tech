const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', roleMiddleware('ADMIN'), userController.getAllUsers);
router.get('/:id', roleMiddleware('ADMIN'), userController.getUserById);
router.put('/:id/status', roleMiddleware('ADMIN'), userController.updateUserStatus);

module.exports = router;
