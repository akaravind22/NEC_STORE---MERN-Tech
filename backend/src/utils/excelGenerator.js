const ExcelJS = require('exceljs');

// ═══════════════════════════════════════════════════════════════════
// 1. SALES REVENUE EXCEL REPORT
// ═══════════════════════════════════════════════════════════════════
const generateSalesExcel = async (orders, filterInfo = '') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  worksheet.columns = [
    { key: 'id', width: 14 },
    { key: 'customerName', width: 26 },
    { key: 'customerEmail', width: 28 },
    { key: 'paymentStatus', width: 16 },
    { key: 'orderStatus', width: 16 },
    { key: 'deliveryStatus', width: 16 },
    { key: 'totalAmount', width: 20 },
    { key: 'date', width: 24 }
  ];

  // 1. Title Banner
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'NEC CAMPUS STORE — SALES REVENUE & ORDERS REPORT';
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E40AF' } // Royal Blue
  };
  worksheet.getRow(1).height = 32;

  // 2. Metadata Subheader
  worksheet.mergeCells('A2:H2');
  const metaCell = worksheet.getCell('A2');
  metaCell.value = (filterInfo || 'Scope: Overall (All Sales)') + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Orders: ' + orders.length;
  metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  metaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F3F4F6' }
  };
  worksheet.getRow(2).height = 22;

  worksheet.getRow(3).values = [];
  worksheet.getRow(3).height = 10;

  // 3. Headers
  const headers = [
    'Order ID',
    'Customer Name',
    'Email Address',
    'Payment Status',
    'Order Status',
    'Delivery Status',
    'Total Amount (₹)',
    'Order Date & Time'
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 26;
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2563EB' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: '1E40AF' } },
      bottom: { style: 'medium', color: { argb: '1E40AF' } },
      left: { style: 'thin', color: { argb: '3B82F6' } },
      right: { style: 'thin', color: { argb: '3B82F6' } }
    };
  });

  let totalSalesAmount = 0;

  orders.forEach((o, idx) => {
    const amt = parseFloat(o.totalAmount || 0);
    totalSalesAmount += amt;

    const row = worksheet.addRow({
      id: '#ORD-' + String(o.id).padStart(4, '0'),
      customerName: o.User ? o.User.name : 'Walk-in Student',
      customerEmail: o.User ? o.User.email : 'N/A',
      paymentStatus: o.paymentStatus || 'PAID',
      orderStatus: o.orderStatus || 'COMPLETED',
      deliveryStatus: o.deliveryStatus || 'DELIVERED',
      totalAmount: '₹' + amt.toFixed(2),
      date: new Date(o.createdAt).toLocaleString('en-IN')
    });

    row.height = 22;
    row.alignment = { vertical: 'middle' };

    if (idx % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F9FAFB' }
      };
    }

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } }
      };
    });
  });

  // Summary Row
  const summaryRow = worksheet.addRow({
    id: 'TOTAL / SUMMARY',
    customerName: orders.length + ' Orders',
    customerEmail: '-',
    paymentStatus: '-',
    orderStatus: '-',
    deliveryStatus: '-',
    totalAmount: '₹' + totalSalesAmount.toFixed(2),
    date: '-'
  });

  summaryRow.height = 28;
  summaryRow.font = { bold: true, size: 11, color: { argb: '1E40AF' } };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DBEAFE' }
  };
  summaryRow.alignment = { vertical: 'middle' };
  summaryRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: '2563EB' } },
      bottom: { style: 'double', color: { argb: '2563EB' } }
    };
  });

  return await workbook.xlsx.writeBuffer();
};

// ═══════════════════════════════════════════════════════════════════
// 2. INVENTORY STOCK REPORT
// ═══════════════════════════════════════════════════════════════════
const generateStockExcel = async (products, filterInfo = '') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Stock Report');

  worksheet.columns = [
    { key: 'id', width: 14 },
    { key: 'category', width: 22 },
    { key: 'name', width: 38 },
    { key: 'quantity', width: 16 },
    { key: 'threshold', width: 20 },
    { key: 'buyingPrice', width: 18 },
    { key: 'sellingPrice', width: 18 },
    { key: 'status', width: 18 },
    { key: 'valuation', width: 24 }
  ];

  worksheet.mergeCells('A1:I1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'NEC CAMPUS STORE — INVENTORY STOCK & VALUATION REPORT';
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0F766E' }
  };
  worksheet.getRow(1).height = 32;

  worksheet.mergeCells('A2:I2');
  const metaCell = worksheet.getCell('A2');
  metaCell.value = (filterInfo || 'Scope: Overall Catalog') + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Items: ' + products.length;
  metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  metaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F3F4F6' }
  };
  worksheet.getRow(2).height = 22;

  worksheet.getRow(3).values = [];
  worksheet.getRow(3).height = 10;

  const headers = [
    'Product ID',
    'Category',
    'Product Name',
    'Current Stock',
    'Low Stock Threshold',
    'Buying Cost (₹)',
    'Selling Price (₹)',
    'Stock Status',
    'Total Valuation (₹)'
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 26;
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0D9488' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: '0F766E' } },
      bottom: { style: 'medium', color: { argb: '0F766E' } },
      left: { style: 'thin', color: { argb: '14B8A6' } },
      right: { style: 'thin', color: { argb: '14B8A6' } }
    };
  });

  let totalUnits = 0;
  let totalValuation = 0;

  products.forEach((p, idx) => {
    const isOut = p.quantity === 0;
    const isLow = p.quantity > 0 && p.quantity <= p.lowStockThreshold;
    const statusText = isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'HEALTHY';
    const qty = p.quantity || 0;
    const bPrice = parseFloat(p.buyingPrice || 0);
    const sPrice = parseFloat(p.sellingPrice || 0);
    const val = qty * bPrice;

    totalUnits += qty;
    totalValuation += val;

    const row = worksheet.addRow({
      id: '#PROD-' + String(p.id).padStart(4, '0'),
      category: p.Category ? p.Category.name : 'Stationery',
      name: p.name,
      quantity: qty + ' units',
      threshold: p.lowStockThreshold + ' units',
      buyingPrice: '₹' + bPrice.toFixed(2),
      sellingPrice: '₹' + sPrice.toFixed(2),
      status: statusText,
      valuation: '₹' + val.toFixed(2)
    });

    row.height = 22;
    row.alignment = { vertical: 'middle' };

    if (idx % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F9FAFB' }
      };
    }

    const statusCell = row.getCell(8);
    if (isOut) statusCell.font = { bold: true, color: { argb: 'DC2626' } };
    else if (isLow) statusCell.font = { bold: true, color: { argb: 'D97706' } };
    else statusCell.font = { bold: true, color: { argb: '16A34A' } };

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } }
      };
    });
  });

  const summaryRow = worksheet.addRow({
    id: 'TOTAL / SUMMARY',
    category: '-',
    name: products.length + ' Products',
    quantity: totalUnits + ' units in stock',
    threshold: '-',
    buyingPrice: '-',
    sellingPrice: '-',
    status: '-',
    valuation: '₹' + totalValuation.toFixed(2)
  });

  summaryRow.height = 28;
  summaryRow.font = { bold: true, size: 11, color: { argb: '0F766E' } };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'CCFBF1' }
  };
  summaryRow.alignment = { vertical: 'middle' };
  summaryRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: '0D9488' } },
      bottom: { style: 'double', color: { argb: '0D9488' } }
    };
  });

  return await workbook.xlsx.writeBuffer();
};

// ═══════════════════════════════════════════════════════════════════
// 3. INCOMING STOCK HISTORY REPORT
// ═══════════════════════════════════════════════════════════════════
const generateStockHistoryExcel = async (historyLogs, filterInfo = '') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Incoming Stock');

  worksheet.columns = [
    { key: 'id', width: 14 },
    { key: 'productName', width: 34 },
    { key: 'purchasedFrom', width: 30 },
    { key: 'retailerName', width: 22 },
    { key: 'prevQty', width: 14 },
    { key: 'addedQty', width: 14 },
    { key: 'newQty', width: 14 },
    { key: 'newPrice', width: 18 },
    { key: 'avgPrice', width: 20 },
    { key: 'date', width: 24 }
  ];

  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'NEC CAMPUS STORE — INCOMING STOCK & AUDIT HISTORY';
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '5B21B6' } // Purple
  };
  worksheet.getRow(1).height = 32;

  worksheet.mergeCells('A2:J2');
  const metaCell = worksheet.getCell('A2');
  metaCell.value = (filterInfo || 'Scope: Overall Stock History') + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Logs: ' + historyLogs.length;
  metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  metaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F3F4F6' }
  };
  worksheet.getRow(2).height = 22;

  worksheet.getRow(3).values = [];
  worksheet.getRow(3).height = 10;

  const headers = [
    'Log ID',
    'Product Name',
    'Purchased From (Vendor)',
    'Logged By',
    'Previous Qty',
    'Added Units',
    'New Stock',
    'Batch Rate (₹)',
    'Avg Cost (WAC) (₹)',
    'Date & Time'
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 26;
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '7C3AED' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: '5B21B6' } },
      bottom: { style: 'medium', color: { argb: '5B21B6' } },
      left: { style: 'thin', color: { argb: '6D28D9' } },
      right: { style: 'thin', color: { argb: '6D28D9' } }
    };
  });

  let totalAddedUnits = 0;

  historyLogs.forEach((h, idx) => {
    const added = h.addedQuantity || 0;
    totalAddedUnits += added;

    const row = worksheet.addRow({
      id: '#LOG-' + String(h.id).padStart(4, '0'),
      productName: h.Product ? h.Product.name : (h.productName || 'Product'),
      purchasedFrom: h.purchasedFrom || h.supplier || 'Authorized Wholesale Supplier',
      retailerName: h.retailer ? h.retailer.name : (h.purchaserName || 'Campus Retailer'),
      prevQty: (h.previousQuantity || 0) + ' units',
      addedQty: '+' + added + ' units',
      newQty: (h.newQuantity || 0) + ' units',
      newPrice: '₹' + parseFloat(h.newBuyingPrice || h.purchaseRatePerUnit || 0).toFixed(2),
      avgPrice: '₹' + parseFloat(h.averageBuyingPrice || h.averageCostPrice || 0).toFixed(2),
      date: new Date(h.createdAt).toLocaleString('en-IN')
    });

    row.height = 22;
    row.alignment = { vertical: 'middle' };

    if (idx % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F9FAFB' }
      };
    }

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } }
      };
    });
  });

  const summaryRow = worksheet.addRow({
    id: 'TOTAL / SUMMARY',
    productName: historyLogs.length + ' Restock Logs',
    purchasedFrom: '-',
    retailerName: '-',
    prevQty: '-',
    addedQty: totalAddedUnits + ' units added',
    newQty: '-',
    newPrice: '-',
    avgPrice: '-',
    date: '-'
  });

  summaryRow.height = 28;
  summaryRow.font = { bold: true, size: 11, color: { argb: '5B21B6' } };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'EDE9FE' }
  };
  summaryRow.alignment = { vertical: 'middle' };
  summaryRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: '7C3AED' } },
      bottom: { style: 'double', color: { argb: '7C3AED' } }
    };
  });

  return await workbook.xlsx.writeBuffer();
};

// ═══════════════════════════════════════════════════════════════════
// 4. TRANSACTIONS AUDIT REPORT (Razorpay Student Orders)
// ═══════════════════════════════════════════════════════════════════
const generateTransactionsExcel = async (transactions, filterInfo = '') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transactions');

  worksheet.columns = [
    { key: 'id', width: 14 },
    { key: 'orderId', width: 14 },
    { key: 'customerName', width: 26 },
    { key: 'amount', width: 18 },
    { key: 'paymentMethod', width: 18 },
    { key: 'razorpayId', width: 28 },
    { key: 'status', width: 16 },
    { key: 'date', width: 24 }
  ];

  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'NEC CAMPUS STORE — STUDENT PAYMENT TRANSACTIONS AUDIT';
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '065F46' } // Emerald Dark
  };
  worksheet.getRow(1).height = 32;

  worksheet.mergeCells('A2:H2');
  const metaCell = worksheet.getCell('A2');
  metaCell.value = (filterInfo || 'Scope: Overall Transactions') + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Txns: ' + transactions.length;
  metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  metaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F3F4F6' }
  };
  worksheet.getRow(2).height = 22;

  worksheet.getRow(3).values = [];
  worksheet.getRow(3).height = 10;

  const headers = [
    'Txn ID',
    'Order ID',
    'Customer Name',
    'Amount (₹)',
    'Payment Method',
    'Razorpay Payment ID',
    'Status',
    'Date & Time'
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 26;
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '059669' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: '065F46' } },
      bottom: { style: 'medium', color: { argb: '065F46' } },
      left: { style: 'thin', color: { argb: '10B981' } },
      right: { style: 'thin', color: { argb: '10B981' } }
    };
  });

  let totalAmount = 0;

  transactions.forEach((t, idx) => {
    const amt = parseFloat(t.amount || t.totalAmount || 0);
    totalAmount += amt;

    const row = worksheet.addRow({
      id: '#TXN-' + String(t.id).padStart(4, '0'),
      orderId: '#ORD-' + String(t.orderId || t.id).padStart(4, '0'),
      customerName: t.User ? t.User.name : (t.customerName || 'Student Customer'),
      amount: '₹' + amt.toFixed(2),
      paymentMethod: t.paymentMethod || 'RAZORPAY (Online UPI/Cards)',
      razorpayId: t.razorpayPaymentId || 'pay_verified_nec',
      status: t.status || t.paymentStatus || 'SUCCESS',
      date: new Date(t.createdAt).toLocaleString('en-IN')
    });

    row.height = 22;
    row.alignment = { vertical: 'middle' };

    if (idx % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F9FAFB' }
      };
    }

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } }
      };
    });
  });

  const summaryRow = worksheet.addRow({
    id: 'TOTAL / SUMMARY',
    orderId: transactions.length + ' Txns',
    customerName: '-',
    amount: '₹' + totalAmount.toFixed(2),
    paymentMethod: '-',
    razorpayId: '-',
    status: '-',
    date: '-'
  });

  summaryRow.height = 28;
  summaryRow.font = { bold: true, size: 11, color: { argb: '065F46' } };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'D1FAE5' }
  };
  summaryRow.alignment = { vertical: 'middle' };
  summaryRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: '059669' } },
      bottom: { style: 'double', color: { argb: '059669' } }
    };
  });

  return await workbook.xlsx.writeBuffer();
};

// ═══════════════════════════════════════════════════════════════════
// 5. PURCHASES & EXPENDITURE REPORT
// ═══════════════════════════════════════════════════════════════════
const generatePurchasesExcel = async (purchases, filterInfo = '') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Purchases Report');

  worksheet.columns = [
    { key: 'batchId', width: 16 },
    { key: 'category', width: 18 },
    { key: 'productName', width: 34 },
    { key: 'purchasedFrom', width: 30 },
    { key: 'unitsAdded', width: 14 },
    { key: 'stockFlow', width: 16 },
    { key: 'purchaseRate', width: 20 },
    { key: 'avgCost', width: 20 },
    { key: 'totalCost', width: 22 },
    { key: 'date', width: 24 }
  ];

  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'NEC CAMPUS STORE — PRODUCT PURCHASES & EXPENDITURE REPORT';
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4C1D95' }
  };
  worksheet.getRow(1).height = 32;

  worksheet.mergeCells('A2:J2');
  const metaCell = worksheet.getCell('A2');
  metaCell.value = (filterInfo || 'Scope: Overall (All Categories)') + '  •  Exported on: ' + new Date().toLocaleString('en-IN') + '  •  Total Batches: ' + purchases.length;
  metaCell.font = { italic: true, size: 10, color: { argb: '374151' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  metaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F3F4F6' }
  };
  worksheet.getRow(2).height = 22;

  worksheet.getRow(3).values = [];
  worksheet.getRow(3).height = 10;

  const headers = [
    'Batch ID',
    'Category',
    'Product Name',
    'Purchased From',
    'Units Added',
    'Stock Flow',
    'Purchase Rate (₹)',
    'Avg Cost (WAC) (₹)',
    'Total Cost (₹)',
    'Purchase Date & Time'
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headers;
  headerRow.height = 26;
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10.5 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '7C3AED' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: '4C1D95' } },
      bottom: { style: 'medium', color: { argb: '4C1D95' } },
      left: { style: 'thin', color: { argb: '6D28D9' } },
      right: { style: 'thin', color: { argb: '6D28D9' } }
    };
  });

  let totalUnits = 0;
  let totalSpent = 0;

  purchases.forEach((p, idx) => {
    const added = p.addedQuantity || 0;
    const rate = parseFloat(p.purchaseRatePerUnit !== undefined ? p.purchaseRatePerUnit : (p.newBuyingPrice || 0));
    const cost = parseFloat(p.totalPurchaseCost !== undefined ? p.totalPurchaseCost : (added * rate));
    totalUnits += added;
    totalSpent += cost;

    const row = worksheet.addRow({
      batchId: '#PURCH-' + String(p.id).padStart(4, '0'),
      category: p.categoryName || p.Product?.Category?.name || 'General',
      productName: p.productName || p.Product?.name || 'Product',
      purchasedFrom: p.purchasedFrom || p.supplier || 'Authorized Wholesale Supplier',
      unitsAdded: '+' + added + ' units',
      stockFlow: (p.previousQuantity || 0) + ' → ' + (p.newQuantity || 0),
      purchaseRate: '₹' + rate.toFixed(2),
      avgCost: '₹' + parseFloat(p.averageCostPrice !== undefined ? p.averageCostPrice : (p.averageBuyingPrice || 0)).toFixed(2),
      totalCost: '₹' + cost.toFixed(2),
      date: new Date(p.createdAt).toLocaleString('en-IN')
    });

    row.height = 22;
    row.alignment = { vertical: 'middle' };

    if (idx % 2 === 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F9FAFB' }
      };
    }

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } }
      };
    });
  });

  const summaryRow = worksheet.addRow({
    batchId: 'TOTAL / SUMMARY',
    category: '-',
    productName: purchases.length + ' Batches',
    purchasedFrom: '-',
    unitsAdded: totalUnits + ' units',
    stockFlow: '-',
    purchaseRate: '-',
    avgCost: '-',
    totalCost: '₹' + totalSpent.toFixed(2),
    date: '-'
  });

  summaryRow.height = 28;
  summaryRow.font = { bold: true, size: 11, color: { argb: '4C1D95' } };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'EDE9FE' }
  };
  summaryRow.alignment = { vertical: 'middle' };
  summaryRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'medium', color: { argb: '7C3AED' } },
      bottom: { style: 'double', color: { argb: '7C3AED' } }
    };
  });

  return await workbook.xlsx.writeBuffer();
};

module.exports = {
  generateSalesExcel,
  generateStockExcel,
  generateStockHistoryExcel,
  generateTransactionsExcel,
  generatePurchasesExcel
};
