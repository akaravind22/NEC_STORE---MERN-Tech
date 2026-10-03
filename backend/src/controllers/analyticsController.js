const { User, Product, Order, OrderItem, Transaction, StockHistory, Category } = require('../models');
const { Op } = require('sequelize');

// Comprehensive Retailer Analytics & Performance Metrics
const getRetailerStats = async (req, res, next) => {
  try {
    const { range = '7d', startDate, endDate } = req.query;

    // Calculate Date Bounds
    let filterStart = null;
    let filterEnd = new Date();
    filterEnd.setHours(23, 59, 59, 999);

    if (startDate && endDate) {
      filterStart = new Date(startDate + 'T00:00:00');
      filterEnd = new Date(endDate + 'T23:59:59');
    } else if (range === '7d') {
      filterStart = new Date();
      filterStart.setDate(filterStart.getDate() - 6);
      filterStart.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
      filterStart = new Date();
      filterStart.setDate(filterStart.getDate() - 29);
      filterStart.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      filterStart = new Date();
      filterStart.setDate(1);
      filterStart.setHours(0, 0, 0, 0);
    } else {
      // All time (last 1 year default)
      filterStart = new Date();
      filterStart.setFullYear(filterStart.getFullYear() - 1);
      filterStart.setHours(0, 0, 0, 0);
    }

    const dateOrderWhere = {
      orderStatus: { [Op.ne]: 'CANCELLED' }
    };
    if (filterStart) {
      dateOrderWhere.createdAt = { [Op.between]: [filterStart, filterEnd] };
    }

    // 1. Fetch Orders within range
    const orders = await Order.findAll({
      where: dateOrderWhere,
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { 
          model: OrderItem, 
          as: 'items',
          include: [{ 
            model: Product, 
            include: [{ model: Category, attributes: ['id', 'name'] }] 
          }]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // 2. Fetch all products for stock & inventory metrics
    const allProducts = await Product.findAll({
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    // 3. Fetch Stock History (Wholesale Purchases) within range
    const purchaseWhere = {};
    if (filterStart) {
      purchaseWhere.createdAt = { [Op.between]: [filterStart, filterEnd] };
    }
    const purchases = await StockHistory.findAll({
      where: purchaseWhere,
      include: [{ model: Product, attributes: ['id', 'name', 'sellingPrice'] }]
    });

    // Financial KPI Calculations
    let totalRevenue = 0;
    let totalCostOfGoodsSold = 0;
    let totalUnitsSold = 0;

    // Track category sales & product sales
    const categoryMap = {};
    const productSalesMap = {};

    orders.forEach(order => {
      const orderTotal = parseFloat(order.totalAmount || 0);
      totalRevenue += orderTotal;

      (order.items || []).forEach(item => {
        const qty = item.quantity || 1;
        const selling = parseFloat(item.unitPrice || item.Product?.sellingPrice || 0);
        const buying = parseFloat(item.Product?.buyingPrice || 0);
        const subtotal = parseFloat(item.subtotal || (qty * selling));

        totalUnitsSold += qty;
        totalCostOfGoodsSold += (qty * buying);

        // Category breakdown
        const catName = item.Product?.Category?.name || 'General';
        if (!categoryMap[catName]) {
          categoryMap[catName] = { name: catName, revenue: 0, units: 0 };
        }
        categoryMap[catName].revenue += subtotal;
        categoryMap[catName].units += qty;

        // Product sales breakdown
        const prodId = item.productId || item.Product?.id;
        const prodName = item.Product?.name || 'Item #' + prodId;
        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = {
            id: prodId,
            name: prodName,
            category: catName,
            unitsSold: 0,
            revenue: 0,
            buyingPrice: buying,
            sellingPrice: selling,
            currentStock: item.Product?.quantity || 0,
            threshold: item.Product?.lowStockThreshold || 10
          };
        }
        productSalesMap[prodId].unitsSold += qty;
        productSalesMap[prodId].revenue += subtotal;
      });
    });

    // Wholesale Stock Purchase Expenditure
    let totalWholesalePurchases = 0;
    let totalPurchasedUnits = 0;
    purchases.forEach(p => {
      const batchCost = parseFloat(p.newBuyingPrice || 0) * (p.addedQuantity || 0);
      totalWholesalePurchases += batchCost;
      totalPurchasedUnits += (p.addedQuantity || 0);
    });

    // Profit Metrics
    const grossProfit = totalRevenue - totalCostOfGoodsSold;
    const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0;
    const averageOrderValue = orders.length > 0 ? (totalRevenue / orders.length) : 0;

    // Category Sales List
    const categoryBreakdown = Object.values(categoryMap).map(c => ({
      name: c.name,
      revenue: parseFloat(c.revenue.toFixed(2)),
      units: c.units,
      percentage: totalRevenue > 0 ? parseFloat(((c.revenue / totalRevenue) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.revenue - a.revenue);

    // Top Selling Products Leaderboard
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10)
      .map((p, idx) => ({
        rank: idx + 1,
        id: p.id,
        name: p.name,
        category: p.category,
        unitsSold: p.unitsSold,
        revenue: parseFloat(p.revenue.toFixed(2)),
        currentStock: p.currentStock,
        stockStatus: p.currentStock === 0 ? 'OUT_OF_STOCK' : p.currentStock <= p.threshold ? 'LOW_STOCK' : 'HEALTHY'
      }));

    // Daily Sales & Order Volume Trend
    // Determine days between start and end
    const dayDiff = Math.max(1, Math.ceil((filterEnd - filterStart) / (1000 * 60 * 60 * 24)));
    const salesTrend = [];

    // Format days
    for (let i = 0; i < Math.min(dayDiff, 31); i++) {
      const curDate = new Date(filterStart);
      curDate.setDate(curDate.getDate() + i);
      const dayStart = new Date(curDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(curDate.setHours(23, 59, 59, 999));

      const dayOrders = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od >= dayStart && od <= dayEnd;
      });

      const daySales = dayOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);

      salesTrend.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dayStart.toISOString().split('T')[0],
        formattedDate: dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        sales: parseFloat(daySales.toFixed(2)),
        orders: dayOrders.length
      });
    }

    // Order Fulfillment Status Breakdown
    const allOrdersCount = await Order.count();
    const deliveredCount = await Order.count({ where: { deliveryStatus: 'DELIVERED' } });
    const pendingPickupCount = await Order.count({ where: { deliveryStatus: 'NOT_DELIVERED', orderStatus: { [Op.ne]: 'CANCELLED' } } });
    const processingCount = await Order.count({ where: { orderStatus: 'PROCESSING' } });
    const cancelledCount = await Order.count({ where: { orderStatus: 'CANCELLED' } });

    const fulfillmentChart = [
      { name: 'Delivered / Collected', value: deliveredCount, color: '#16a34a' },
      { name: 'Pending Pickup', value: pendingPickupCount, color: '#f59e0b' },
      { name: 'Processing', value: processingCount, color: '#3b82f6' },
      { name: 'Cancelled', value: cancelledCount, color: '#ef4444' }
    ];

    // Fast-Depleting & Low Stock Items
    const lowStockAlerts = allProducts
      .filter(p => p.quantity <= p.lowStockThreshold)
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.Category?.name || 'General',
        quantity: p.quantity,
        threshold: p.lowStockThreshold,
        status: p.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        buyingPrice: parseFloat(p.buyingPrice || 0),
        sellingPrice: parseFloat(p.sellingPrice || 0)
      }))
      .slice(0, 8);

    return res.status(200).json({
      success: true,
      timeframe: {
        range,
        startDate: filterStart ? filterStart.toISOString().split('T')[0] : null,
        endDate: filterEnd.toISOString().split('T')[0]
      },
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCostOfGoodsSold: parseFloat(totalCostOfGoodsSold.toFixed(2)),
        grossProfit: parseFloat(grossProfit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(1)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        totalOrders: orders.length,
        totalUnitsSold,
        totalWholesalePurchases: parseFloat(totalWholesalePurchases.toFixed(2)),
        totalPurchasedUnits,
        totalActiveProducts: allProducts.length,
        pendingDeliveries: pendingPickupCount,
        lowStockCount: lowStockAlerts.length
      },
      charts: {
        salesTrend,
        categoryBreakdown,
        fulfillmentChart
      },
      topProducts,
      lowStockAlerts
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
