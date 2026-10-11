const bcrypt = require('bcryptjs');
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

// Create Staff / Retailer / Admin user (Admin only)
const createStaffUser = async (req, res, next) => {
  try {
    const { name, email, rollNumber, department, phone, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Full Name and Email Address are required.' });
    }

    if (!['RETAILER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Staff role must be RETAILER or ADMIN.' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    if (rollNumber) {
      const existingStaffId = await User.findOne({ where: { rollNumber } });
      if (existingStaffId) {
        return res.status(409).json({ success: false, message: 'An account with this Staff ID already exists.' });
      }
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('Password123', 10);

    const user = await User.create({
      name,
      email,
      rollNumber: rollNumber || null,
      department: department || null,
      phone: phone || null,
      role,
      status: 'ACTIVE',
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: `${role === 'RETAILER' ? 'Retailer' : 'Administrator'} account created successfully for ${user.name}.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Change user role (Admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['CUSTOMER', 'RETAILER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'ADMIN' && req.user.id === user.id && role !== 'ADMIN') {
      return res.status(400).json({ success: false, message: 'You cannot revoke your own admin role.' });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role has been updated to ${role}.`,
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


// Delete / Remove user permanently from store (Admin only)
const deleteUser = async (req, res, next) => {
  const { sequelize, Notification, OTPVerification, Order, OrderItem, Transaction, StockHistory } = require('../models');
  const t = await sequelize.transaction();
  try {
    const userIdToDelete = req.params.id;

    const user = await User.findByPk(userIdToDelete, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Safety: Admin cannot delete their own account
    if (user.role === 'ADMIN' && req.user.id === user.id) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'You cannot remove your own administrator account.' });
    }

    // Clean up notifications for this user
    await Notification.destroy({ where: { userId: user.id }, transaction: t });

    // Clean up OTP verifications for this email
    await OTPVerification.destroy({ where: { email: user.email }, transaction: t });

    // Clean up user transactions and orders safely
    const userOrders = await Order.findAll({ where: { userId: user.id }, transaction: t });
    for (const ord of userOrders) {
      await OrderItem.destroy({ where: { orderId: ord.id }, transaction: t });
      await Transaction.destroy({ where: { orderId: ord.id }, transaction: t });
      await ord.destroy({ transaction: t });
    }
    await Transaction.destroy({ where: { userId: user.id }, transaction: t });

    // Clean up StockHistory where user was retailer
    await StockHistory.destroy({ where: { retailerId: user.id }, transaction: t });

    const deletedUserName = user.name;
    const deletedUserRole = user.role;

    // Permanently destroy user
    await user.destroy({ transaction: t });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: `Account for "${deletedUserName}" (${deletedUserRole}) has been permanently removed from the store.`
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = {
  deleteUser,
  getAllUsers,
  getUserById,
  createStaffUser,
  updateUserRole,
  updateUserStatus
};
