const { Notification } = require('../models');
const { Op } = require('sequelize');

// Get Notifications for User or Admin/Retailer
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let whereClause = {};

    if (role === 'CUSTOMER') {
      whereClause = { userId };
    } else {
      // Admin and Retailer see notifications assigned to them or broadcast notifications (userId null)
      whereClause = {
        [Op.or]: [
          { userId },
          { userId: null }
        ]
      };
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// Mark single notification as read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification
    });
  } catch (error) {
    next(error);
  }
};

// Mark all as read
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let whereClause = role === 'CUSTOMER' 
      ? { userId, isRead: false }
      : { [Op.or]: [{ userId }, { userId: null }], isRead: false };

    await Notification.update({ isRead: true }, { where: whereClause });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
