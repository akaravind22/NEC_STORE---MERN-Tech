const { User, Order } = require('../models');
const { Op } = require('sequelize');

// Get all users (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    let whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { rollNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    if (role) whereClause.role = role;
    if (status) whereClause.status = status;

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [{ model: Order, attributes: ['id', 'totalAmount', 'createdAt'] }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Order }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Suspend or Activate user status (Admin only)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be ACTIVE or SUSPENDED.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'ADMIN' && req.user.id === user.id) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own admin account.' });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account has been ${status === 'ACTIVE' ? 'activated' : 'suspended'}.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus
};
