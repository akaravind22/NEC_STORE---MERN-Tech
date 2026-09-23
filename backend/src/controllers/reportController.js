const { Order, Product, Category, User, Transaction, StockHistory } = require('../models');
const {
  generateSalesExcel,
  generateStockExcel,
  generateStockHistoryExcel,
  generateTransactionsExcel
} = require('../utils/excelGenerator');

// Download Sales Report Excel
const downloadSalesReport = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    const buffer = await generateSalesExcel(orders);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=NEC_Store_Sales_Report_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Download Stock Report Excel
const downloadStockReport = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, attributes: ['name'] }],
      order: [['name', 'ASC']]
    });

    const buffer = await generateStockExcel(products);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=NEC_Store_Stock_Report_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Download Incoming Stock History Excel
const downloadStockHistoryReport = async (req, res, next) => {
  try {
    const history = await StockHistory.findAll({
      include: [
        { model: Product, attributes: ['name'] },
        { model: User, as: 'retailer', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const buffer = await generateStockHistoryExcel(history);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=NEC_Store_Stock_History_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Download Transactions Report Excel
const downloadTransactionsReport = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      include: [{ model: User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    const buffer = await generateTransactionsExcel(transactions);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=NEC_Store_Transactions_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadSalesReport,
  downloadStockReport,
  downloadStockHistoryReport,
  downloadTransactionsReport
};
