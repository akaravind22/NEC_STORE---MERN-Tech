const { Product, Category, Order, OrderItem, User, StoreSetting, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper to format currency
const formatRupee = (amount) => {
  return `₹${parseFloat(amount || 0).toFixed(2)}`;
};

// Helper to format 12h time
const format12Hour = (timeStr) => {
  if (!timeStr) return '';
  const str = String(timeStr).trim();
  if (/am|pm/i.test(str)) return str;
  const parts = str.split(':');
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) return str;
  const m = (parts[1] || '00').padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
};

// Clean search keywords by removing common stopwords
const extractKeywords = (text) => {
  const stopwords = new Set([
    'is', 'the', 'book', 'books', 'a', 'an', 'are', 'in', 'of', 'for', 'to', 'at', 'and', 'or',
    'available', 'stock', 'check', 'do', 'you', 'have', 'what', 'whats', 'tell', 'me', 'price',
    'cost', 'how', 'much', 'any', 'can', 'i', 'get', 'buy', 'item', 'product', 'items', 'please'
  ]);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopwords.has(w));
  return words;
};

// Main Chatbot Message Handler
exports.handleChatMessage = async (req, res) => {
  try {
    const rawMessage = (req.body.message || '').trim();
    if (!rawMessage) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const lowerMsg = rawMessage.toLowerCase();
    const userRole = req.user ? req.user.role : 'CUSTOMER';
    const userId = req.user ? req.user.id : null;

    let reply = '';
    let suggestions = [];
    let dataPayload = null;

    // =========================================================================
    // 1. ADMIN ROLE CHATBOT
    // =========================================================================
    if (userRole === 'ADMIN') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      if (
        lowerMsg.includes('user') ||
        lowerMsg.includes('student') ||
        lowerMsg.includes('register') ||
        lowerMsg.includes('account') ||
        lowerMsg.includes('created today')
      ) {
        // Users created today & role metrics
        const usersToday = await User.count({ where: { createdAt: { [Op.gte]: startOfDay } } });
        const studentsToday = await User.count({ where: { role: 'CUSTOMER', createdAt: { [Op.gte]: startOfDay } } });
        const retailersToday = await User.count({ where: { role: 'RETAILER', createdAt: { [Op.gte]: startOfDay } } });
        const totalUsers = await User.count();
        const totalStudents = await User.count({ where: { role: 'CUSTOMER' } });
        const totalRetailers = await User.count({ where: { role: 'RETAILER' } });
        const totalAdmins = await User.count({ where: { role: 'ADMIN' } });

        reply = `👥 **System User Analytics Report:**\n\n` +
          `• **Registered Today:** ${usersToday} new user(s)\n` +
          `  - Students today: **${studentsToday}**\n` +
          `  - Retailers / Staff today: **${retailersToday}**\n\n` +
          `• **Overall User Base (${totalUsers} Total Accounts):**\n` +
          `  - 🎓 Students (Customers): **${totalStudents}**\n` +
          `  - 🏪 Retailers (Store Staff): **${totalRetailers}**\n` +
          `  - 🛡️ System Administrators: **${totalAdmins}**\n\n` +
          `*Tip: To create or assign new retailer staff, navigate to User Management (/admin/users).* `;

        suggestions = [
          'Show overall store sales revenue',
          'How many orders placed today?',
          'Check system audit & health',
          'How to create retailer staff?'
        ];
      } else if (
        lowerMsg.includes('sales') ||
        lowerMsg.includes('revenue') ||
        lowerMsg.includes('financial') ||
        lowerMsg.includes('money') ||
        lowerMsg.includes('gmv')
      ) {
        const totalSalesSum = await Order.sum('totalAmount', { where: { orderStatus: { [Op.ne]: 'CANCELLED' } } }) || 0;
        const totalOrders = await Order.count();
        const completedOrders = await Order.count({ where: { orderStatus: 'COMPLETED' } });
        const todaySales = await Order.sum('totalAmount', {
          where: { createdAt: { [Op.gte]: startOfDay }, orderStatus: { [Op.ne]: 'CANCELLED' } }
        }) || 0;

        reply = `📈 **Campus Store Financial Overview:**\n\n` +
          `• **Gross Platform Sales:** **${formatRupee(totalSalesSum)}**\n` +
          `• **Today's Sales Revenue:** **${formatRupee(todaySales)}**\n` +
          `• **Lifetime Orders Processed:** **${totalOrders}** orders (${completedOrders} fulfilled)\n` +
          `• **Payment Gateway:** 100% verified via Razorpay TLS & Webhook signature authentication.`;

        suggestions = [
          'How many users created today?',
          'Show total inventory count',
          'Check system audit & health'
        ];
      } else if (lowerMsg.includes('create retailer') || lowerMsg.includes('add staff') || lowerMsg.includes('role')) {
        reply = `🛡️ **Admin Role Provisioning Guide:**\n\n` +
          `1. Students only register publicly as Customers.\n` +
          `2. To create a Retailer / Staff account, visit **User Management** (/admin/users).\n` +
          `3. Click **"+ Create Retailer / Staff"** button and enter their name, college email, and department.\n` +
          `4. They will immediately receive an email OTP and gain retailer management access.`;

        suggestions = [
          'How many users created today?',
          'Show overall store sales revenue',
          'How many orders placed today?'
        ];
      } else if (lowerMsg.includes('order') || lowerMsg.includes('today')) {
        const ordersToday = await Order.count({ where: { createdAt: { [Op.gte]: startOfDay } } });
        const pendingCount = await Order.count({ where: { orderStatus: ['CREATED', 'PROCESSING'] } });
        const todaySales = await Order.sum('totalAmount', {
          where: { createdAt: { [Op.gte]: startOfDay }, orderStatus: { [Op.ne]: 'CANCELLED' } }
        }) || 0;

        reply = `🛒 **Today's Orders Overview (Admin Level):**\n\n` +
          `• **Orders Placed Today:** **${ordersToday}** order(s)\n` +
          `• **Today's Volume Value:** **${formatRupee(todaySales)}**\n` +
          `• **Currently Pending Fulfillment:** **${pendingCount}** order(s)\n\n` +
          `*All orders are assigned to Central Co-op Store for student verification.* `;

        suggestions = [
          'How many users created today?',
          'Show overall store sales revenue',
          'Check system audit & health'
        ];
      } else {
        reply = `👋 Hello **${req.user.name}** (Admin).\n\nI am your **System Intelligence Assistant**. You can ask me about:\n` +
          `• *"How many users are created today?"*\n` +
          `• *"What is the total platform sales revenue?"*\n` +
          `• *"How many orders placed today?"*\n` +
          `• *"Breakdown of students vs retailers"*\n` +
          `• *"How to add retailer staff?"*`;

        suggestions = [
          'How many users created today?',
          'Show overall store sales revenue',
          'How many orders placed today?',
          'Check system audit & health'
        ];
      }

      return res.json({ success: true, reply, suggestions, data: dataPayload });
    }

    // =========================================================================
    // 2. RETAILER ROLE CHATBOT
    // =========================================================================
    if (userRole === 'RETAILER') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      if (
        lowerMsg.includes('order') ||
        lowerMsg.includes('today') ||
        lowerMsg.includes('how many orders') ||
        lowerMsg.includes('volume')
      ) {
        const ordersToday = await Order.count({ where: { createdAt: { [Op.gte]: startOfDay } } });
        const todaySales = await Order.sum('totalAmount', {
          where: { createdAt: { [Op.gte]: startOfDay }, orderStatus: { [Op.ne]: 'CANCELLED' } }
        }) || 0;
        const pendingToday = await Order.count({
          where: { createdAt: { [Op.gte]: startOfDay }, orderStatus: ['CREATED', 'PROCESSING'] }
        });
        const completedToday = await Order.count({
          where: { createdAt: { [Op.gte]: startOfDay }, orderStatus: 'COMPLETED' }
        });

        reply = `📦 **Today's Store Order Performance:**\n\n` +
          `• **Total Orders Today:** **${ordersToday}** order(s)\n` +
          `• **Today's Sales Revenue:** **${formatRupee(todaySales)}**\n` +
          `• **Pending / Packing:** **${pendingToday}** order(s)\n` +
          `• **Completed / Picked Up:** **${completedToday}** order(s)\n\n` +
          `*You can review full details in Customer Orders (/retailer/orders).* `;

        suggestions = [
          'Which items are low on stock?',
          'What is today’s total sales revenue?',
          'List pending orders to prepare',
          'Check store operating timings'
        ];
      } else if (
        lowerMsg.includes('stock') ||
        lowerMsg.includes('inventory') ||
        lowerMsg.includes('low') ||
        lowerMsg.includes('reorder') ||
        lowerMsg.includes('units')
      ) {
        // Low stock items
        const lowStockItems = await Product.findAll({
          where: {
            quantity: { [Op.lte]: 5 }
          },
          order: [['quantity', 'ASC']],
          limit: 6
        });

        const totalStockUnits = await Product.sum('quantity') || 0;
        const totalActiveProds = await Product.count();

        if (lowStockItems.length === 0) {
          reply = `✅ **Inventory Health:** Excellent! All **${totalActiveProds}** products have sufficient stock (Total Units: **${totalStockUnits}**). No products currently below threshold.`;
        } else {
          reply = `⚠️ **Low Stock Alert (${lowStockItems.length} Products Need Replenishment):**\n\n` +
            lowStockItems.map(p => `• **${p.name}**: ${p.quantity === 0 ? '❌ **OUT OF STOCK**' : `⚠️ **${p.quantity} units left** (Threshold: ${p.lowStockThreshold || 5})`} — Price: ${formatRupee(p.sellingPrice || p.price)}`).join('\n') +
            `\n\n*Total Active Catalog: ${totalActiveProds} products | Total Stock: ${totalStockUnits} units.* `;
        }

        suggestions = [
          'How many orders placed today?',
          'What is today’s total sales revenue?',
          'List pending orders to prepare'
        ];
      } else if (lowerMsg.includes('revenue') || lowerMsg.includes('sales') || lowerMsg.includes('money')) {
        const todaySales = await Order.sum('totalAmount', {
          where: { createdAt: { [Op.gte]: startOfDay }, orderStatus: { [Op.ne]: 'CANCELLED' } }
        }) || 0;
        const totalSalesSum = await Order.sum('totalAmount', { where: { orderStatus: { [Op.ne]: 'CANCELLED' } } }) || 0;

        reply = `💰 **Store Revenue Breakdown:**\n\n` +
          `• **Today's Revenue:** **${formatRupee(todaySales)}**\n` +
          `• **Total Cumulative Sales:** **${formatRupee(totalSalesSum)}**\n\n` +
          `*For in-depth 7-day trend charts and analytics, visit Sales Analytics (/retailer/sales).* `;

        suggestions = [
          'How many orders placed today?',
          'Which items are low on stock?',
          'List pending orders to prepare'
        ];
      } else if (lowerMsg.includes('pending') || lowerMsg.includes('unfulfilled') || lowerMsg.includes('pack')) {
        const pendingOrders = await Order.findAll({
          where: { orderStatus: ['CREATED', 'PROCESSING'] },
          include: [{ model: User, attributes: ['name', 'rollNumber'] }],
          order: [['createdAt', 'DESC']],
          limit: 5
        });

        if (pendingOrders.length === 0) {
          reply = `✨ **All Caught Up!** You have **0 pending orders** waiting for packaging or pickup right now.`;
        } else {
          reply = `📋 **Pending Orders Awaiting Packaging / Pickup (${pendingOrders.length}):**\n\n` +
            pendingOrders.map(o => `• **Order #${o.id}** — ${formatRupee(o.totalAmount)} by **${o.User?.name || 'Student'}** (${o.orderStatus})`).join('\n') +
            `\n\n*Open Customer Orders (/retailer/orders) to update status to COMPLETED once collected.* `;
        }

        suggestions = [
          'How many orders placed today?',
          'Which items are low on stock?',
          'Check store operating timings'
        ];
      } else if (lowerMsg.includes('timing') || lowerMsg.includes('hours') || lowerMsg.includes('lunch') || lowerMsg.includes('closed')) {
        const setting = await StoreSetting.findByPk(1);
        reply = `🕒 **Current Store Timing & Schedule:**\n\n` +
          `• **Current Status:** **${setting?.status || 'AUTO'}** (${setting?.statusMessage || 'Regular Timetable'})\n` +
          `• **Starting Time:** ${format12Hour(setting?.openTime || '08:30')}\n` +
          `• **Closing Time:** ${format12Hour(setting?.closeTime || '17:30')}\n` +
          `• **Lunch Break:** ${format12Hour(setting?.lunchStart || '13:00')} – ${format12Hour(setting?.lunchEnd || '14:00')}\n` +
          `• **Working Days:** ${setting?.workingDays || 'Monday – Saturday'}\n\n` +
          `*You can adjust timings anytime in Store Timings & Status (/retailer/timings).* `;

        suggestions = [
          'How many orders placed today?',
          'Which items are low on stock?',
          'What is today’s total sales revenue?'
        ];
      } else {
        reply = `👋 Hello **${req.user.name}** (Campus Retailer).\n\nI am your **Store Operations AI Assistant**. Ask me any question like:\n` +
          `• *"How many orders are placed today?"*\n` +
          `• *"Which items are low on stock?"*\n` +
          `• *"What is today's sales revenue?"*\n` +
          `• *"List pending orders to prepare"*\n` +
          `• *"What are the current store timings?"*`;

        suggestions = [
          'How many orders placed today?',
          'Which items are low on stock?',
          'What is today’s total sales revenue?',
          'List pending orders to prepare'
        ];
      }

      return res.json({ success: true, reply, suggestions, data: dataPayload });
    }

    // =========================================================================
    // 3. CUSTOMER / GUEST ROLE CHATBOT
    // =========================================================================
    // Check for Order tracking
    if (lowerMsg.includes('my order') || lowerMsg.includes('track') || lowerMsg.includes('order status') || (lowerMsg.includes('order') && /#?\d+/.test(lowerMsg))) {
      if (!userId) {
        reply = `📦 **Order Tracking:**\n\nPlease **log in** with your college email and OTP to view your orders and track real-time delivery/pickup status!\n\n[Click here to Login](/login)`;
        suggestions = ['Check textbook availability', 'Is the store open now?', 'Where is the pickup store?'];
      } else {
        // Extract order ID if provided e.g. "#4" or "order 4"
        const orderMatch = lowerMsg.match(/#?(\d+)/);
        let userOrders = [];

        if (orderMatch) {
          const matchedId = parseInt(orderMatch[1], 10);
          userOrders = await Order.findAll({
            where: { id: matchedId, userId },
            include: [{ model: OrderItem, as: 'items', include: [Product] }]
          });
        }

        if (userOrders.length === 0) {
          // Fetch user's latest 3 orders
          userOrders = await Order.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 3
          });
        }

        if (userOrders.length === 0) {
          reply = `📦 You don't have any orders placed yet! Browse our campus store catalog to find lab records, calculators, textbooks, and essentials.\n\n[Browse Products](/products)`;
          suggestions = ['Check textbook availability', 'Do you have scientific calculators?', 'Is the store open now?'];
        } else {
          reply = `📦 **Your Recent Orders:**\n\n` +
            userOrders.map(o => {
              const statusBadge = o.orderStatus === 'COMPLETED'
                ? '✅ **Ready / Picked Up**'
                : o.orderStatus === 'CANCELLED'
                ? '❌ **Cancelled**'
                : '⏳ **Processing / Preparing**';
              return `• **Order #${o.id}** — ${formatRupee(o.totalAmount)} (${new Date(o.createdAt).toLocaleDateString()})\n  Status: ${statusBadge}`;
            }).join('\n\n') +
            `\n\n📍 **Pickup Counter:** Central Co-op Store, Block A (Bring your roll number / Order ID).\n[View All Orders](/customer/orders)`;

          suggestions = ['Check textbook availability', 'Is the store open now?', 'Where is the pickup store?'];
        }
      }
      return res.json({ success: true, reply, suggestions });
    }

    // Check for Store Timings & Opening Hours
    if (lowerMsg.includes('time') || lowerMsg.includes('timing') || lowerMsg.includes('open') || lowerMsg.includes('close') || lowerMsg.includes('hours') || lowerMsg.includes('lunch') || lowerMsg.includes('break')) {
      const setting = await StoreSetting.findByPk(1);
      const openTime = format12Hour(setting?.openTime || '08:30');
      const closeTime = format12Hour(setting?.closeTime || '17:30');
      const lunchInterval = `${format12Hour(setting?.lunchStart || '13:00')} – ${format12Hour(setting?.lunchEnd || '14:00')}`;

      let currentStatusText = '🟢 Open for Instant Pickup';
      if (setting?.status === 'LUNCH_BREAK') {
        currentStatusText = `🥪 Retailer on Lunch Break (${setting?.statusMessage || 'Returns soon'})`;
      } else if (setting?.status === 'TEMPORARILY_CLOSED') {
        currentStatusText = `⏸️ Retailer Temporarily Away (${setting?.statusMessage || 'Back shortly'})`;
      } else if (setting?.status === 'CLOSED') {
        currentStatusText = '🔴 Store Closed';
      }

      reply = `🕒 **NEC Campus Store Operating Hours:**\n\n` +
        `• **Current Live Status:** ${currentStatusText}\n` +
        `• **Starting Time (Opening):** **${openTime}**\n` +
        `• **Closing Time:** **${closeTime}**\n` +
        `• **Lunch Break:** **${lunchInterval}**\n` +
        `• **Working Days:** **${setting?.workingDays || 'Monday – Saturday'}**\n\n` +
        `*Note: Online orders can be placed 24/7 on this website and picked up as soon as the counter is open!* `;

      suggestions = [
        'Is textbook in stock?',
        'Do you have scientific calculators?',
        'Where is the pickup location?'
      ];
      return res.json({ success: true, reply, suggestions });
    }

    // Check for Location & Pickup FAQ
    if (lowerMsg.includes('where') || lowerMsg.includes('location') || lowerMsg.includes('address') || lowerMsg.includes('pickup') || lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('email')) {
      reply = `📍 **NEC Campus Store Location & Support:**\n\n` +
        `• **Counter Location:** Central Co-op Store, Block A (Opposite Main Auditorium)\n` +
        `• **College Campus:** National Engineering Campus\n` +
        `• **Support Email:** support@necstore.com\n` +
        `• **Store Phone:** +91 (044) 2890-1122\n\n` +
        `*Place your orders online to avoid waiting in physical counter lines during break time!* `;

      suggestions = [
        'Is textbook in stock?',
        'What are today’s store hours?',
        'Track my recent order'
      ];
      return res.json({ success: true, reply, suggestions });
    }

    // Product Search & Availability Queries (e.g. "is the book available or not", "scientific calculator", "lab coat")
    const keywords = extractKeywords(rawMessage);
    let searchCriteria = [];

    if (keywords.length > 0) {
      searchCriteria = keywords.map(kw => ({
        [Op.or]: [
          { name: { [Op.like]: `%${kw}%` } },
          { description: { [Op.like]: `%${kw}%` } }
        ]
      }));
    } else {
      // General product request
      searchCriteria = [{ [Op.or]: [{ name: { [Op.like]: '%book%' } }, { name: { [Op.like]: '%lab%' } }] }];
    }

    const matchedProducts = await Product.findAll({
      where: {
        [Op.or]: searchCriteria
      },
      include: [{ model: Category, attributes: ['name'] }],
      limit: 6
    });

    if (matchedProducts.length > 0) {
      reply = `🔍 **Product Availability Search Results:**\n\n` +
        matchedProducts.map(p => {
          const inStock = (p.quantity ?? 0) > 0;
          const stockTag = inStock
            ? `✅ **In Stock** (${p.quantity} available)`
            : `❌ **Out of Stock** (Reorder pending)`;
          return `• **${p.name}**\n  - Price: **${formatRupee(p.sellingPrice || p.price)}**\n  - Availability: ${stockTag}\n  - Category: ${p.Category?.name || 'General'}`;
        }).join('\n\n') +
        `\n\n[View all products in Store Catalog](/products)`;

      suggestions = [
        'What are today’s store hours?',
        'Where is the pickup store?',
        'Track my recent order'
      ];
    } else {
      // No exact keyword match, fetch popular available items
      const popularProducts = await Product.findAll({
        where: { quantity: { [Op.gt]: 0 } },
        limit: 4
      });

      reply = `🤔 I couldn't find an exact product matching **"${rawMessage}"** in the store catalog.\n\nHere are some of our **Popular In-Stock Items** on campus:\n\n` +
        popularProducts.map(p => `• **${p.name}** — **${formatRupee(p.sellingPrice || p.price)}** (✅ In Stock)`).join('\n') +
        `\n\nTry searching for generic terms like *"notebook"*, *"calculator"*, *"uniform"*, or *"lab"*, or browse the full catalog:\n[Browse All Products](/products)`;

      suggestions = [
        'Do you have scientific calculators?',
        'Is lab uniform available?',
        'What are the store hours?'
      ];
    }

    return res.json({ success: true, reply, suggestions });

  } catch (err) {
    console.error('Chatbot error:', err);
    return res.status(500).json({
      success: false,
      reply: 'Sorry, I encountered an issue processing your request. Please try again shortly.',
      suggestions: ['Check textbook availability', 'What are today’s store hours?']
    });
  }
};
