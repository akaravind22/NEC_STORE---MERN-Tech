const { sequelize, Order, OrderItem, Product, Transaction, Notification, User, Category } = require('../models');

// Create Order (Customer)
const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, paymentMethod, razorpayOrderId, razorpayPaymentId } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Cart items are required to create an order.' });
    }

    let calculatedTotal = 0;
    const orderItemsToCreate = [];
    const stockUpdates = [];
    const lowStockAlerts = [];

    // Verify stock and calculate real total from database prices (Security Rule 21)
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t, lock: true });

      if (!product) {
        await t.rollback();
        return res.status(404).json({ success: false, message: `Product ID ${item.productId} no longer exists.` });
      }

      if (product.quantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}.`
        });
      }

      const unitPrice = parseFloat(product.sellingPrice);
      const itemSubtotal = unitPrice * item.quantity;
      calculatedTotal += itemSubtotal;

      orderItemsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: unitPrice,
        subtotal: itemSubtotal
      });

      const newQty = product.quantity - item.quantity;
      stockUpdates.push({ product, newQty });

      if (newQty <= product.lowStockThreshold) {
        lowStockAlerts.push({ name: product.name, remaining: newQty, threshold: product.lowStockThreshold });
      }
    }

    // Create Order Record
    const order = await Order.create({
      userId,
      totalAmount: calculatedTotal,
      paymentStatus: razorpayPaymentId ? 'PAID' : 'UNPAID',
      orderStatus: 'CREATED',
      deliveryStatus: 'NOT_DELIVERED',
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null
    }, { transaction: t });

    // Create Order Items
    for (const oi of orderItemsToCreate) {
      await OrderItem.create({
        orderId: order.id,
        productId: oi.productId,
        quantity: oi.quantity,
        unitPrice: oi.unitPrice,
        subtotal: oi.subtotal
      }, { transaction: t });
    }

    // Deduct stock inside transaction
    for (const update of stockUpdates) {
      await update.product.update({ quantity: update.newQty }, { transaction: t });
    }

    // Create Transaction Record
    await Transaction.create({
      orderId: order.id,
      userId,
      amount: calculatedTotal,
      paymentMethod: paymentMethod || 'RAZORPAY',
      razorpayPaymentId: razorpayPaymentId || null,
      status: razorpayPaymentId ? 'SUCCESS' : 'PROCESSING'
    }, { transaction: t });

    // Commit Transaction
    await t.commit();

    // Create Notifications (Outside transaction so DB lock is released immediately)
    // 1. Retailer notification for new order
    await Notification.create({
      userId: null,
      title: 'New Order Received',
      message: `Order #${order.id} placed by ${req.user.name} for ₹${calculatedTotal.toFixed(2)}.`,
      type: 'ORDER_PLACED'
    });

    // 2. Customer payment confirmation notification
    await Notification.create({
      userId: req.user.id,
      title: 'Order Placed Successfully',
      message: `Your order #${order.id} totaling ₹${calculatedTotal.toFixed(2)} has been confirmed!`,
      type: 'PAYMENT_SUCCESS'
    });

    // 3. Low stock notifications
    for (const alert of lowStockAlerts) {
      await Notification.create({
        userId: null,
        title: 'Low Stock Alert',
        message: `Stock for "${alert.name}" has dropped to ${alert.remaining} (Threshold: ${alert.threshold}). Please reorder stock.`,
        type: 'LOW_STOCK'
      });
    }

    const createdOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product }] },
        { model: User, attributes: ['id', 'name', 'email', 'phone'] }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: createdOrder
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Get Customer or Retailer/Admin Orders
const getOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let whereClause = {};

    // Customers can only see their own orders
    if (req.user.role === 'CUSTOMER') {
      whereClause.userId = req.user.id;
    }

    if (status) {
      whereClause.orderStatus = status;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'phone', 'department'] },
        { model: OrderItem, as: 'items', include: [{ model: Product }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Get single order details
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'phone', 'rollNumber', 'department'] },
        { model: OrderItem, as: 'items', include: [{ model: Product }] },
        { model: Transaction }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Security check: Customer can only view their own order
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not own this order.' });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (Retailer / Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, deliveryStatus } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (deliveryStatus) order.deliveryStatus = deliveryStatus;

    await order.save();

    // Notify customer about order status update
    await Notification.create({
      userId: order.userId,
      title: 'Order Status Updated',
      message: `Your Order #${order.id} status changed to ${order.orderStatus} (${order.deliveryStatus}).`,
      type: 'ORDER_UPDATED'
    });

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order
    });
  } catch (error) {
    next(error);
  }
};

// Cancel Order (Customer eligible or Retailer)
const cancelOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t,
      lock: true
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Role check
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ success: false, message: 'Forbidden. You cannot cancel this order.' });
    }

    // Can only cancel CREATED or PROCESSING orders (Rule 35)
    if (order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED') {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Cannot cancel an order with status "${order.orderStatus}".` });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId, { transaction: t, lock: true });
      if (product) {
        await product.update({ quantity: product.quantity + item.quantity }, { transaction: t });
      }
    }

    order.orderStatus = 'CANCELLED';
    await order.save({ transaction: t });

    // Update associated transaction
    await Transaction.update({ status: 'FAILED' }, { where: { orderId: order.id }, transaction: t });

    await t.commit();

    // Send notifications
    await Notification.create({
      userId: order.userId,
      title: 'Order Cancelled',
      message: `Order #${order.id} has been cancelled and product stock has been restored.`,
      type: 'ORDER_CANCELLED'
    });

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and product inventory restored.',
      order
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
