const { initializeDatabase } = require('../config/database');
const { User, Category, Product, Order, OrderItem, Transaction, StockHistory, Notification } = require('../models');

const seedData = async () => {
  try {
    const sequelize = await initializeDatabase();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    // Drop all old/legacy tables to avoid incompatible foreign key leftovers
    const [tables] = await sequelize.query("SHOW TABLES;");
    for (const t of tables) {
      const tableName = Object.values(t)[0];
      await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);
    }
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('[Seed] Database synced cleanly.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Dr. S. K. Sharma (Store Admin)',
      email: 'admin@necstore.com',
      rollNumber: 'ADM-001',
      department: 'Administration',
      phone: '9876543210',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const retailer1 = await User.create({
      name: 'Campus Co-op Retailer',
      email: 'retailer@necstore.com',
      rollNumber: 'RET-001',
      department: 'Central Store',
      phone: '9876543211',
      role: 'RETAILER',
      status: 'ACTIVE'
    });

    const retailer2 = await User.create({
      name: 'Tech & Stationery Mart',
      email: 'retailer2@necstore.com',
      rollNumber: 'RET-002',
      department: 'Stationery Annex',
      phone: '9876543212',
      role: 'RETAILER',
      status: 'ACTIVE'
    });

    const customer1 = await User.create({
      name: 'Aarav Patel',
      email: 'student1@necstore.com',
      rollNumber: 'NEC2024CSE042',
      department: 'Computer Science & Eng',
      phone: '9123456780',
      role: 'CUSTOMER',
      status: 'ACTIVE'
    });

    const customer2 = await User.create({
      name: 'Ananya Sharma',
      email: 'student2@necstore.com',
      rollNumber: 'NEC2024ECE015',
      department: 'Electronics & Comm',
      phone: '9123456781',
      role: 'CUSTOMER',
      status: 'ACTIVE'
    });

    const customer3 = await User.create({
      name: 'Rohan Verma',
      email: 'student3@necstore.com',
      rollNumber: 'NEC2024MECH088',
      department: 'Mechanical Eng',
      phone: '9123456782',
      role: 'CUSTOMER',
      status: 'ACTIVE'
    });

    const customer4 = await User.create({
      name: 'Priya Sundaram',
      email: 'student4@necstore.com',
      rollNumber: 'NEC2024EEE021',
      department: 'Electrical Eng',
      phone: '9123456783',
      role: 'CUSTOMER',
      status: 'ACTIVE'
    });

    const customer5 = await User.create({
      name: 'Vikram Singh',
      email: 'student5@necstore.com',
      rollNumber: 'NEC2024CIVIL009',
      department: 'Civil Eng',
      phone: '9123456784',
      role: 'CUSTOMER',
      status: 'ACTIVE'
    });

    console.log('[Seed] Users seeded successfully.');

    // 2. Create Categories
    const stationeryCat = await Category.create({ name: 'Stationery', description: 'Notebooks, pens, registers, geometry sets, and drafting tools.' });
    const booksCat = await Category.create({ name: 'Books', description: 'Engineering textbooks, reference manuals, and lab guidebooks.' });
    const electronicsCat = await Category.create({ name: 'Electronics', description: 'Calculators, USB drives, microcontrollers, components, and cables.' });
    const accessoriesCat = await Category.create({ name: 'Accessories', description: 'ID card holders, lanyards, laptop bags, and water bottles.' });
    const essentialsCat = await Category.create({ name: 'College Essentials', description: 'NEC branded hoodies, t-shirts, lab coats, and workshop aprons.' });

    console.log('[Seed] Categories seeded successfully.');

    // 3. Create Products
    const productsData = [
      {
        name: 'NEC Premium A4 Notebook 200 Pages (Grid/Ruled)',
        categoryId: stationeryCat.id,
        description: 'High quality 80 GSM paper notebook with durable softbound glass cover.',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 45.00,
        sellingPrice: 80.00,
        quantity: 45,
        lowStockThreshold: 10
      },
      {
        name: 'Casio FX-991EX ClassWiz Engineering Scientific Calculator',
        categoryId: electronicsCat.id,
        description: 'Non-programmable scientific calculator approved for university semester exams.',
        image: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e498?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 1100.00,
        sellingPrice: 1450.00,
        quantity: 15,
        lowStockThreshold: 5
      },
      {
        name: 'Engineering Physics & Lab Manual (2026 Edition)',
        categoryId: booksCat.id,
        description: 'Official core reference book with solved tutorials and laboratory procedures.',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 280.00,
        sellingPrice: 420.00,
        quantity: 3, // LOW STOCK FOR DEMO
        lowStockThreshold: 5
      },
      {
        name: 'SanDisk Ultra 64GB USB 3.0 Pen Drive',
        categoryId: electronicsCat.id,
        description: 'High speed metallic flash drive for project presentations and lab code submission.',
        image: 'https://images.unsplash.com/photo-1618410320928-25228d811631?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 380.00,
        sellingPrice: 550.00,
        quantity: 28,
        lowStockThreshold: 8
      },
      {
        name: 'NEC Official Cotton College Hoodie (Navy Blue - L)',
        categoryId: essentialsCat.id,
        description: 'Premium fleece cotton hoodie with embroidered NEC crest.',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 650.00,
        sellingPrice: 999.00,
        quantity: 12,
        lowStockThreshold: 4
      },
      {
        name: 'Uniball Jetstream Gel Pen (Pack of 5)',
        categoryId: stationeryCat.id,
        description: 'Smooth smudge-proof black gel pens ideal for long written exam answers.',
        image: 'https://images.unsplash.com/photo-1585336261026-8f5786372966?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 120.00,
        sellingPrice: 180.00,
        quantity: 4, // LOW STOCK FOR DEMO
        lowStockThreshold: 10
      },
      {
        name: 'White Chemistry & Biology Lab Coat (Pure Cotton)',
        categoryId: essentialsCat.id,
        description: 'Full sleeve knee-length white lab coat required for all science laboratories.',
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 220.00,
        sellingPrice: 380.00,
        quantity: 22,
        lowStockThreshold: 6
      },
      {
        name: 'Arduino Uno R3 Microcontroller Starter Kit',
        categoryId: electronicsCat.id,
        description: 'Original board with breadboard, sensors, jumper wires, and LEDs for robotics labs.',
        image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 650.00,
        sellingPrice: 890.00,
        quantity: 18,
        lowStockThreshold: 5
      },
      {
        name: 'Rotring Rapid Pro Engineering Drafting Set',
        categoryId: stationeryCat.id,
        description: 'Precision drafting compass, mechanical pencils 0.5mm & 0.7mm, set squares.',
        image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 310.00,
        sellingPrice: 480.00,
        quantity: 10,
        lowStockThreshold: 3
      },
      {
        name: 'NEC Stainless Steel Insulated Thermal Flask (750ml)',
        categoryId: accessoriesCat.id,
        description: 'Double wall vacuum insulated bottle keeps drinks cold for 24 hours.',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 290.00,
        sellingPrice: 499.00,
        quantity: 2, // LOW STOCK FOR DEMO
        lowStockThreshold: 5
      },
      {
        name: 'Data Structures & Algorithms in C++ Textbook',
        categoryId: booksCat.id,
        description: 'Comprehensive computer science guidebook with practice problem sets.',
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 350.00,
        sellingPrice: 520.00,
        quantity: 14,
        lowStockThreshold: 4
      },
      {
        name: 'Heavy Duty Canvas Laptop Backpack (15.6 inch)',
        categoryId: accessoriesCat.id,
        description: 'Water resistant padded bag with USB charging port and multiple organizer pockets.',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
        buyingPrice: 700.00,
        sellingPrice: 1199.00,
        quantity: 16,
        lowStockThreshold: 5
      }
    ];

    const products = [];
    for (const p of productsData) {
      const prod = await Product.create(p);
      products.push(prod);
    }

    console.log('[Seed] Products seeded successfully.');

    // 4. Create Sample Orders & Transactions
    const order1 = await Order.create({
      userId: customer1.id,
      totalAmount: 1530.00,
      paymentStatus: 'PAID',
      orderStatus: 'COMPLETED',
      deliveryStatus: 'DELIVERED',
      razorpayOrderId: 'order_seed_001',
      razorpayPaymentId: 'pay_seed_001'
    });

    await OrderItem.create({
      orderId: order1.id,
      productId: products[1].id, // Casio Calculator
      quantity: 1,
      unitPrice: 1450.00,
      subtotal: 1450.00
    });

    await OrderItem.create({
      orderId: order1.id,
      productId: products[0].id, // Notebook
      quantity: 1,
      unitPrice: 80.00,
      subtotal: 80.00
    });

    await Transaction.create({
      orderId: order1.id,
      userId: customer1.id,
      amount: 1530.00,
      paymentMethod: 'RAZORPAY',
      razorpayPaymentId: 'pay_seed_001',
      status: 'SUCCESS'
    });

    const order2 = await Order.create({
      userId: customer2.id,
      totalAmount: 420.00,
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
      deliveryStatus: 'NOT_DELIVERED',
      razorpayOrderId: 'order_seed_002',
      razorpayPaymentId: 'pay_seed_002'
    });

    await OrderItem.create({
      orderId: order2.id,
      productId: products[2].id, // Physics Manual
      quantity: 1,
      unitPrice: 420.00,
      subtotal: 420.00
    });

    await Transaction.create({
      orderId: order2.id,
      userId: customer2.id,
      amount: 420.00,
      paymentMethod: 'RAZORPAY',
      razorpayPaymentId: 'pay_seed_002',
      status: 'SUCCESS'
    });

    console.log('[Seed] Orders & Transactions seeded successfully.');

    // 5. Stock History Logs
    await StockHistory.create({
      productId: products[0].id,
      retailerId: retailer1.id,
      previousQuantity: 20,
      addedQuantity: 25,
      newQuantity: 45,
      previousBuyingPrice: 40.00,
      newBuyingPrice: 49.00,
      averageBuyingPrice: 45.00
    });

    await StockHistory.create({
      productId: products[1].id,
      retailerId: retailer1.id,
      previousQuantity: 5,
      addedQuantity: 10,
      newQuantity: 15,
      previousBuyingPrice: 1050.00,
      newBuyingPrice: 1125.00,
      averageBuyingPrice: 1100.00
    });

    // 6. Seed Notifications
    await Notification.create({
      userId: null,
      title: 'Low Stock Alert',
      message: 'Engineering Physics & Lab Manual (2026 Edition) has only 3 items remaining.',
      type: 'LOW_STOCK'
    });

    await Notification.create({
      userId: null,
      title: 'Low Stock Alert',
      message: 'Uniball Jetstream Gel Pen has only 4 items remaining.',
      type: 'LOW_STOCK'
    });

    await Notification.create({
      userId: customer1.id,
      title: 'Order Delivered',
      message: 'Your Order #1 containing Casio FX-991EX Calculator has been delivered!',
      type: 'ORDER_UPDATED'
    });

    console.log('[Seed] Notifications seeded successfully.');
    console.log('[Seed] ALL DEMO DATA SEEDED CLEANLY AND SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
};

seedData();
