const ExcelJS = require('exceljs');

const generateSalesExcel = async (orders) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  worksheet.columns = [
    { header: 'Order ID', key: 'id', width: 12 },
    { header: 'Customer Name', key: 'customerName', width: 25 },
    { header: 'Email', key: 'customerEmail', width: 28 },
    { header: 'Total Amount (₹)', key: 'totalAmount', width: 18 },
    { header: 'Payment Status', key: 'paymentStatus', width: 16 },
    { header: 'Order Status', key: 'orderStatus', width: 16 },
    { header: 'Delivery Status', key: 'deliveryStatus', width: 16 },
    { header: 'Date', key: 'createdAt', width: 22 }
  ];

  // Header styling
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2563EB' }
  };

  orders.forEach(order => {
    worksheet.addRow({
      id: order.id,
      customerName: order.User ? order.User.name : 'N/A',
      customerEmail: order.User ? order.User.email : 'N/A',
      totalAmount: parseFloat(order.totalAmount).toFixed(2),
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      deliveryStatus: order.deliveryStatus,
      createdAt: new Date(order.createdAt).toLocaleString()
    });
  });

  return await workbook.xlsx.writeBuffer();
};

const generateStockExcel = async (products) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Stock Report');

  worksheet.columns = [
    { header: 'Product ID', key: 'id', width: 12 },
    { header: 'Product Name', key: 'name', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Buying Price (₹)', key: 'buyingPrice', width: 18 },
    { header: 'Selling Price (₹)', key: 'sellingPrice', width: 18 },
    { header: 'Quantity In Stock', key: 'quantity', width: 18 },
    { header: 'Low Stock Threshold', key: 'lowStockThreshold', width: 20 },
    { header: 'Stock Status', key: 'status', width: 16 }
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0D9488' }
  };

  products.forEach(p => {
    const isLow = p.quantity <= p.lowStockThreshold;
    worksheet.addRow({
      id: p.id,
      name: p.name,
      category: p.Category ? p.Category.name : 'N/A',
      buyingPrice: parseFloat(p.buyingPrice).toFixed(2),
      sellingPrice: parseFloat(p.sellingPrice).toFixed(2),
      quantity: p.quantity,
      lowStockThreshold: p.lowStockThreshold,
      status: isLow ? 'LOW STOCK' : 'HEALTHY'
    });
  });

  return await workbook.xlsx.writeBuffer();
};

const generateStockHistoryExcel = async (historyLogs) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Stock History');

  worksheet.columns = [
    { header: 'Log ID', key: 'id', width: 10 },
    { header: 'Product Name', key: 'productName', width: 28 },
    { header: 'Retailer', key: 'retailerName', width: 22 },
    { header: 'Previous Qty', key: 'prevQty', width: 15 },
    { header: 'Added Qty', key: 'addedQty', width: 15 },
    { header: 'New Qty', key: 'newQty', width: 15 },
    { header: 'Prev Buying Price', key: 'prevPrice', width: 18 },
    { header: 'New Unit Price', key: 'newPrice', width: 18 },
    { header: 'Avg Buying Price', key: 'avgPrice', width: 18 },
    { header: 'Date', key: 'createdAt', width: 22 }
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '7C3AED' }
  };

  historyLogs.forEach(h => {
    worksheet.addRow({
      id: h.id,
      productName: h.Product ? h.Product.name : 'N/A',
      retailerName: h.retailer ? h.retailer.name : 'N/A',
      prevQty: h.previousQuantity,
      addedQty: h.addedQuantity,
      newQty: h.newQuantity,
      prevPrice: parseFloat(h.previousBuyingPrice).toFixed(2),
      newPrice: parseFloat(h.newBuyingPrice).toFixed(2),
      avgPrice: parseFloat(h.averageBuyingPrice).toFixed(2),
      createdAt: new Date(h.createdAt).toLocaleString()
    });
  });

  return await workbook.xlsx.writeBuffer();
};

const generateTransactionsExcel = async (transactions) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transaction History');

  worksheet.columns = [
    { header: 'Txn ID', key: 'id', width: 10 },
    { header: 'Order ID', key: 'orderId', width: 12 },
    { header: 'Customer', key: 'customerName', width: 24 },
    { header: 'Amount (₹)', key: 'amount', width: 16 },
    { header: 'Payment Method', key: 'paymentMethod', width: 18 },
    { header: 'Razorpay Payment ID', key: 'razorpayPaymentId', width: 26 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Date', key: 'createdAt', width: 22 }
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '059669' }
  };

  transactions.forEach(t => {
    worksheet.addRow({
      id: t.id,
      orderId: t.orderId,
      customerName: t.User ? t.User.name : 'N/A',
      amount: parseFloat(t.amount).toFixed(2),
      paymentMethod: t.paymentMethod,
      razorpayPaymentId: t.razorpayPaymentId || 'N/A',
      status: t.status,
      createdAt: new Date(t.createdAt).toLocaleString()
    });
  });

  return await workbook.xlsx.writeBuffer();
};

module.exports = {
  generateSalesExcel,
  generateStockExcel,
  generateStockHistoryExcel,
  generateTransactionsExcel
};
