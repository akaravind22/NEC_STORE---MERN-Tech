const { User, Product, Order, OrderItem, Transaction, StockHistory } = require('../models');
const { Op } = require('sequelize');

// Retailer Dashboard Analytics
const getRetailerStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.count();
    
    // Sum total stock quantity
    const totalStockResult = await Product.sum('quantity');
    const totalStock = totalStockResult || 0;

    // Today's orders
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaysOrdersCount = await Order.count({
      where: { createdAt: { [Op.gte]: startOfToday } }
    });

    const pendingOrdersCount = await Order.count({
      where: { orderStatus: { [Op.in]: ['CREATED', 'PROCESSING'] } }
    });

    // Total sales sum
    const totalSalesResult = await Order.sum('totalAmount', {
      where: { orderStatus: { [Op.ne]: 'CANCELLED' } }
    });
    const totalSales = totalSalesResult || 0;

    // Low stock count
    const products = await Product.findAll();
    const lowStockCount = products.filter(p => p.quantity <= p.lowStockThreshold).length;

    // Sales history for chart (Last 7 days)
    const salesChart = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const daySales = await Order.sum('totalAmount', {
        where: {
          createdAt: { [Op.between]: [dayStart, dayEnd] },
          orderStatus: { [Op.ne]: 'CANCELLED' }
        }
      });

      const dayOrders = await Order.count({
        where: { createdAt: { [Op.between]: [dayStart, dayEnd] } }
      });

      const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'short' });
      salesChart.push({
        day: dayName,
        date: dayStart.toISOString().split('T')[0],
        sales: daySales || 0,
        orders: dayOrders || 0
      });
    }

    // Order Status Breakdown
    const createdCount = await Order.count({ where: { orderStatus: 'CREATED' } });
    const processingCount = await Order.count({ where: { orderStatus: 'PROCESSING' } });
    const completedCount = await Order.count({ where: { orderStatus: 'COMPLETED' } });
    const cancelledCount = await Order.count({ where: { orderStatus: 'CANCELLED' } });

    const orderStatusChart = [
      { name: 'Created', value: createdCount },
      { name: 'Processing', value: processingCount },
      { name: 'Completed', value: completedCount },
      { name: 'Cancelled', value: cancelledCount }
    ];

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalStock,
        todaysOrders: todaysOrdersCount,
        pendingOrders: pendingOrdersCount,
        totalSales,
        lowStockProducts: lowStockCount
      },
      charts: {
        salesChart,
        orderStatusChart
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin Dashboard Analytics
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalCustomers = await User.count({ where: { role: 'CUSTOMER' } });
    const totalRetailers = await User.count({ where: { role: 'RETAILER' } });
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    const totalSalesResult = await Order.sum('totalAmount', {
      where: { orderStatus: { [Op.ne]: 'CANCELLED' } }
    });
    const totalSales = totalSalesResult || 0;

    const products = await Product.findAll();
    const lowStockCount = products.filter(p => p.quantity <= p.lowStockThreshold).length;

    const pendingOrdersCount = await Order.count({
      where: { orderStatus: { [Op.in]: ['CREATED', 'PROCESSING'] } }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalRetailers,
        totalProducts,
        totalOrders,
        totalSales,
        lowStockProducts: lowStockCount,
        pendingOrders: pendingOrdersCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRetailerStats,
  getAdminStats
};
