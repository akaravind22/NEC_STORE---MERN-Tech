const { sequelize, Product, StockHistory, User, Notification, Category } = require('../models');
const { Op } = require('sequelize');

// Add Stock with Weighted Average Buying Price Formula (Retailer)
const addStock = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { productId, addedQuantity, newBuyingPrice, newSellingPrice } = req.body;
    const retailerId = req.user.id;

    if (!productId || !addedQuantity || newBuyingPrice === undefined) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'productId, addedQuantity, and newBuyingPrice are required.' });
    }

    const qtyToAdd = parseInt(addedQuantity);
    const unitBuyingPrice = parseFloat(newBuyingPrice);

    if (qtyToAdd <= 0 || unitBuyingPrice <= 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Added quantity and buying price must be greater than 0.' });
    }

    const product = await Product.findByPk(productId, { transaction: t, lock: true });

    if (!product) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const prevQty = product.quantity;
    const prevBuyingPrice = parseFloat(product.buyingPrice);
    const newQty = prevQty + qtyToAdd;

    // Weighted Average Cost formula:
    // (Old Qty * Old Price + New Qty * New Price) / Total Qty
    const rawWeightedAvgPrice = prevQty === 0
      ? unitBuyingPrice
      : ((prevQty * prevBuyingPrice) + (qtyToAdd * unitBuyingPrice)) / newQty;

    // Round up the weighted average cost
    const weightedAvgPrice = Math.ceil(rawWeightedAvgPrice);

    // Update Product Stock and Buying Price (Weighted Average rounded up)
    product.quantity = newQty;
    product.buyingPrice = parseFloat(weightedAvgPrice.toFixed(2));

    // Update selling price if a new one was provided
    if (newSellingPrice !== undefined && parseFloat(newSellingPrice) > 0) {
      product.sellingPrice = parseFloat(parseFloat(newSellingPrice).toFixed(2));
    }

    await product.save({ transaction: t });

    // Store Stock History log
    const historyLog = await StockHistory.create({
      productId: product.id,
      retailerId,
      previousQuantity: prevQty,
      addedQuantity: qtyToAdd,
      newQuantity: newQty,
      previousBuyingPrice: prevBuyingPrice,
      newBuyingPrice: unitBuyingPrice,
      averageBuyingPrice: parseFloat(weightedAvgPrice.toFixed(2)),
      supplier: req.body.supplier || req.body.purchasedFrom || 'Authorized Wholesale Supplier'
    }, { transaction: t });

    await t.commit();

    // Create Notification
    await Notification.create({
      userId: null,
      title: 'Stock Replenished',
      message: `${qtyToAdd} units added for "${product.name}". New stock: ${newQty}, Weighted Avg Cost: ?${weightedAvgPrice.toFixed(2)}.`,
      type: 'STOCK_ADDED'
    });

    return res.status(200).json({
      success: true,
      message: `Successfully restocked ${qtyToAdd} units of "${product.name}". Updated WAC: ?${weightedAvgPrice.toFixed(2)}`,
      data: {
        product: {
          id: product.id,
          name: product.name,
          quantity: product.quantity,
          buyingPrice: product.buyingPrice,
          sellingPrice: product.sellingPrice
        },
        historyLog
      }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Fetch Complete Stock Audit History
const getStockHistory = async (req, res, next) => {
  try {
    const { productId, limit = 50, page = 1 } = req.query;
    const where = {};
    if (productId) {
      where.productId = productId;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: history } = await StockHistory.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'buyingPrice', 'sellingPrice', 'quantity'],
          include: [{ model: Category, attributes: ['id', 'name'] }]
        },
        {
          model: User,
          as: 'retailer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Purchase / Inflow Transactions (Wholesale audit list)
const getPurchaseTransactions = async (req, res, next) => {
  try {
    const { supplier, search, limit = 100, page = 1 } = req.query;
    const where = {};

    if (supplier && supplier !== 'ALL') {
      where.supplier = supplier;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: purchases } = await StockHistory.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'buyingPrice', 'sellingPrice', 'quantity', 'image'],
          include: [{ model: Category, attributes: ['id', 'name'] }]
        },
        {
          model: User,
          as: 'retailer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return res.status(200).json({
      success: true,
      data: purchases,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addStock,
  getStockHistory,
  getPurchaseTransactions
};
