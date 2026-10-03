const { Order, Product, Category, User, Transaction, StockHistory, OrderItem } = require('../models');
const {
  generateSalesExcel,
  generateStockExcel,
  generateStockHistoryExcel,
  generateTransactionsExcel,
  generatePurchasesExcel
} = require('../utils/excelGenerator');

// 1. Download Sales Report Excel
const downloadSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, search, status } = req.query;

    let orders = await Order.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { 
          model: OrderItem, 
          include: [{ model: Product, include: [{ model: Category, attributes: ['name'] }] }] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    let filterDesc = [];
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o => 
        (o.User && o.User.name && o.User.name.toLowerCase().includes(q)) ||
        (o.User && o.User.email && o.User.email.toLowerCase().includes(q)) ||
        String(o.id).includes(q)
      );
      filterDesc.push('Search: "' + search + '"');
    }
    if (status && status !== 'ALL') {
      orders = orders.filter(o => o.orderStatus === status || o.paymentStatus === status);
      filterDesc.push('Status: ' + status);
    }
    if (startDate) {
      const start = new Date(startDate + 'T00:00:00');
      orders = orders.filter(o => new Date(o.createdAt) >= start);
      filterDesc.push('From: ' + startDate);
    }
    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      orders = orders.filter(o => new Date(o.createdAt) <= end);
      filterDesc.push('To: ' + endDate);
    }

    const filterInfo = filterDesc.length > 0 ? 'Scope: Filtered (' + filterDesc.join(' | ') + ')' : 'Scope: Overall (All Sales)';
    const buffer = await generateSalesExcel(orders, filterInfo);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=NEC_Store_Sales_Report_' + Date.now() + '.xlsx');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 2. Download Stock Report Excel
const downloadStockReport = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;

    let products = await Product.findAll({
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });

    let filterDesc = [];
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || String(p.id).includes(q));
      filterDesc.push('Search: "' + search + '"');
    }
    if (category && category !== 'ALL') {
      products = products.filter(p => 
        String(p.categoryId) === String(category) || 
        (p.Category && p.Category.name.toLowerCase() === category.toLowerCase())
      );
      filterDesc.push('Category: ' + category);
    }
    if (status && status !== 'ALL') {
      if (status === 'OUT' || status === 'OUT_OF_STOCK') {
        products = products.filter(p => p.quantity === 0);
        filterDesc.push('Stock Status: Out of Stock');
      } else if (status === 'LOW' || status === 'LOW_STOCK') {
        products = products.filter(p => p.quantity > 0 && p.quantity <= p.lowStockThreshold);
        filterDesc.push('Stock Status: Low Stock');
      } else if (status === 'HEALTHY' || status === 'IN_STOCK') {
        products = products.filter(p => p.quantity > p.lowStockThreshold);
        filterDesc.push('Stock Status: Healthy In-Stock');
      }
    }

    const filterInfo = filterDesc.length > 0 ? 'Scope: Filtered (' + filterDesc.join(' | ') + ')' : 'Scope: Overall Inventory Catalog';
    const buffer = await generateStockExcel(products, filterInfo);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=NEC_Store_Stock_Report_' + Date.now() + '.xlsx');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 3. Download Incoming Stock History Excel
const downloadStockHistoryReport = async (req, res, next) => {
  try {
    const { startDate, endDate, search, category } = req.query;

    let history = await StockHistory.findAll({
      include: [
        { 
          model: Product, 
          attributes: ['id', 'name', 'categoryId'],
          include: [{ model: Category, attributes: ['id', 'name'] }]
        },
        { model: User, as: 'retailer', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    let filterDesc = [];
    if (search) {
      const q = search.toLowerCase();
      history = history.filter(h => 
        (h.Product && h.Product.name && h.Product.name.toLowerCase().includes(q)) ||
        (h.supplier && h.supplier.toLowerCase().includes(q)) ||
        String(h.id).includes(q)
      );
      filterDesc.push('Search: "' + search + '"');
    }
    if (category && category !== 'ALL') {
      history = history.filter(h => 
        String(h.Product && h.Product.categoryId) === String(category) || 
        (h.Product && h.Product.Category && h.Product.Category.name.toLowerCase() === category.toLowerCase())
      );
      filterDesc.push('Category: ' + category);
    }
    if (startDate) {
      const start = new Date(startDate + 'T00:00:00');
      history = history.filter(h => new Date(h.createdAt) >= start);
      filterDesc.push('From: ' + startDate);
    }
    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      history = history.filter(h => new Date(h.createdAt) <= end);
      filterDesc.push('To: ' + endDate);
    }

    const filterInfo = filterDesc.length > 0 ? 'Scope: Filtered (' + filterDesc.join(' | ') + ')' : 'Scope: Overall Stock History';
    const buffer = await generateStockHistoryExcel(history, filterInfo);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=NEC_Store_Stock_History_' + Date.now() + '.xlsx');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 4. Download Transactions Report Excel
const downloadTransactionsReport = async (req, res, next) => {
  try {
    const { startDate, endDate, search, status, type } = req.query;

    let transactions = await Transaction.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    let filterDesc = [];
    if (search) {
      const q = search.toLowerCase();
      transactions = transactions.filter(t => 
        (t.User && t.User.name && t.User.name.toLowerCase().includes(q)) ||
        (t.razorpayPaymentId && t.razorpayPaymentId.toLowerCase().includes(q)) ||
        String(t.id).includes(q) ||
        String(t.orderId).includes(q)
      );
      filterDesc.push('Search: "' + search + '"');
    }
    if (status && status !== 'ALL') {
      transactions = transactions.filter(t => (t.status || '').toUpperCase() === status.toUpperCase());
      filterDesc.push('Status: ' + status);
    }
    if (type && type !== 'ALL') {
      transactions = transactions.filter(t => (t.type || '').toUpperCase() === type.toUpperCase());
      filterDesc.push('Type: ' + type);
    }
    if (startDate) {
      const start = new Date(startDate + 'T00:00:00');
      transactions = transactions.filter(t => new Date(t.createdAt) >= start);
      filterDesc.push('From: ' + startDate);
    }
    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      transactions = transactions.filter(t => new Date(t.createdAt) <= end);
      filterDesc.push('To: ' + endDate);
    }

    const filterInfo = filterDesc.length > 0 ? 'Scope: Filtered (' + filterDesc.join(' | ') + ')' : 'Scope: Overall Transactions';
    const buffer = await generateTransactionsExcel(transactions, filterInfo);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=NEC_Store_Transactions_' + Date.now() + '.xlsx');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// 5. Download Purchases Report Excel
const downloadPurchasesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, search, category } = req.query;

    const history = await StockHistory.findAll({
      include: [
        { 
          model: Product, 
          attributes: ['id', 'name', 'sellingPrice', 'categoryId'],
          include: [{ model: Category, attributes: ['id', 'name'] }]
        },
        { model: User, as: 'retailer', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    let filtered = history.map(h => ({
      id: h.id,
      productId: h.productId,
      productName: h.Product ? h.Product.name : 'Product',
      category: h.Product && h.Product.Category ? h.Product.Category.name : 'Stationery',
      supplier: h.supplier || 'Authorized Wholesale Supplier',
      purchasedFrom: h.supplier || 'Authorized Wholesale Supplier',
      sellingPrice: parseFloat(h.Product && h.Product.sellingPrice || 0),
      retailer: h.retailer,
      purchaserName: h.retailer ? h.retailer.name : 'Campus Retailer',
      addedQuantity: h.addedQuantity,
      previousQuantity: h.previousQuantity,
      newQuantity: h.newQuantity,
      purchaseRatePerUnit: parseFloat(h.newBuyingPrice),
      averageCostPrice: parseFloat(h.averageBuyingPrice),
      previousCostPrice: parseFloat(h.previousBuyingPrice),
      totalPurchaseCost: parseFloat((h.addedQuantity * h.newBuyingPrice).toFixed(2)),
      createdAt: h.createdAt
    }));

    let filterDesc = [];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.productName.toLowerCase().includes(q) || 
        p.purchasedFrom.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
      filterDesc.push('Search: "' + search + '"');
    }
    if (category && category !== 'ALL') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      filterDesc.push('Category: ' + category);
    }
    if (startDate) {
      const start = new Date(startDate + 'T00:00:00');
      filtered = filtered.filter(p => new Date(p.createdAt) >= start);
      filterDesc.push('From: ' + startDate);
    }
    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      filtered = filtered.filter(p => new Date(p.createdAt) <= end);
      filterDesc.push('To: ' + endDate);
    }

    const filterInfo = filterDesc.length > 0 ? 'Scope: Filtered (' + filterDesc.join(' | ') + ')' : 'Scope: Overall Purchases & Expenditure';
    const buffer = await generatePurchasesExcel(filtered, filterInfo);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=NEC_Store_Purchases_Report_' + Date.now() + '.xlsx');
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadSalesReport,
  downloadStockReport,
  downloadStockHistoryReport,
  downloadTransactionsReport,
  downloadPurchasesReport
};
