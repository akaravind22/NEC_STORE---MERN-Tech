const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', roleMiddleware('ADMIN'), userController.getAllUsers);
router.post('/create-staff', roleMiddleware('ADMIN'), userController.createStaffUser);
router.get('/:id', roleMiddleware('ADMIN'), userController.getUserById);
router.put('/:id/role', roleMiddleware('ADMIN'), userController.updateUserRole);
router.put('/:id/status', roleMiddleware('ADMIN'), userController.updateUserStatus);

module.exports = router;
