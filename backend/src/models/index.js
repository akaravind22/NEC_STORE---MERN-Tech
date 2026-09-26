const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'RETAILER', 'CUSTOMER'),
    defaultValue: 'CUSTOMER'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'SUSPENDED'),
    defaultValue: 'ACTIVE'
  }
}, { tableName: 'users', timestamps: true });

// OTPVerification Model
const OTPVerification = sequelize.define('OTPVerification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { tableName: 'otp_verifications', timestamps: true });

// Category Model
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, { tableName: 'categories', timestamps: true });

// Product Model
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  buyingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  }
}, { tableName: 'products', timestamps: true });

// Order Model
const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('UNPAID', 'PAID', 'FAILED'),
    defaultValue: 'UNPAID'
  },
  orderStatus: {
    type: DataTypes.ENUM('CREATED', 'PROCESSING', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'CREATED'
  },
  deliveryStatus: {
    type: DataTypes.ENUM('NOT_DELIVERED', 'DELIVERED'),
    defaultValue: 'NOT_DELIVERED'
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, { tableName: 'orders', timestamps: true });

// OrderItem Model
const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, { tableName: 'order_items', timestamps: true });

// Transaction Model
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: 'RAZORPAY'
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('SUCCESS', 'FAILED', 'PROCESSING'),
    defaultValue: 'PROCESSING'
  }
}, { tableName: 'transactions', timestamps: true });

// StockHistory Model
const StockHistory = sequelize.define('StockHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  retailerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previousQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  addedQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  newQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previousBuyingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  newBuyingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  averageBuyingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, { tableName: 'stock_history', timestamps: true });

// Notification Model
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true // null means broadcast / admin notification
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'INFO'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { tableName: 'notifications', timestamps: true });


// StoreSetting Model (Configured by Retailer & Admin)
const StoreSetting = sequelize.define('StoreSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM('AUTO', 'OPEN', 'LUNCH_BREAK', 'TEMPORARILY_CLOSED', 'CLOSED'),
    defaultValue: 'AUTO'
  },
  statusMessage: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  openTime: { type: DataTypes.STRING(50),
    defaultValue: '08:30'
  },
  closeTime: { type: DataTypes.STRING(50),
    defaultValue: '17:30'
  },
  lunchStart: { type: DataTypes.STRING(50),
    defaultValue: '13:00'
  },
  lunchEnd: { type: DataTypes.STRING(50),
    defaultValue: '14:00'
  },
  workingDays: {
    type: DataTypes.STRING,
    defaultValue: 'Monday – Saturday'
  },
  allowOrdersWhenClosed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, { tableName: 'store_settings', timestamps: true });

// Associations
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Order.hasOne(Transaction, { foreignKey: 'orderId' });
Transaction.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(StockHistory, { foreignKey: 'productId' });
StockHistory.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(StockHistory, { foreignKey: 'retailerId', as: 'stockLog' });
StockHistory.belongsTo(User, { foreignKey: 'retailerId', as: 'retailer' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
StoreSetting.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

module.exports = {
  sequelize,
  User,
  OTPVerification,
  Category,
  Product,
  Order,
  OrderItem,
  Transaction,
  StockHistory,
  Notification,
  StoreSetting
};
