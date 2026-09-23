const { Product, Category } = require('../models');
const { Op } = require('sequelize');

// Get all products with search, filtering, and sorting
const getAllProducts = async (req, res, next) => {
  try {
    const { search, categoryId, minPrice, maxPrice, availability, sortBy, order } = req.query;

    let whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      whereClause.sellingPrice = {};
      if (minPrice) whereClause.sellingPrice[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.sellingPrice[Op.lte] = parseFloat(maxPrice);
    }

    if (availability === 'in_stock') {
      whereClause.quantity = { [Op.gt]: 0 };
    } else if (availability === 'out_of_stock') {
      whereClause.quantity = 0;
    }

    let sortOption = [['createdAt', 'DESC']];
    if (sortBy === 'price_asc') sortOption = [['sellingPrice', 'ASC']];
    if (sortBy === 'price_desc') sortOption = [['sellingPrice', 'DESC']];
    if (sortBy === 'name') sortOption = [['name', 'ASC']];
    if (sortBy === 'newest') sortOption = [['createdAt', 'DESC']];

    const products = await Product.findAll({
      where: whereClause,
      include: [{ model: Category, attributes: ['id', 'name', 'description'] }],
      order: sortOption
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// Get single product
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, attributes: ['id', 'name', 'description'] }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// Create product (Retailer / Admin)
const createProduct = async (req, res, next) => {
  try {
    const { name, categoryId, description, image, buyingPrice, sellingPrice, quantity, lowStockThreshold } = req.body;

    if (!name || !categoryId || buyingPrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Product name, category, buying price, and selling price are required.' });
    }

    if (parseFloat(sellingPrice) <= 0 || parseFloat(buyingPrice) <= 0) {
      return res.status(400).json({ success: false, message: 'Prices must be greater than 0.' });
    }

    if (parseInt(quantity) < 0 || parseInt(lowStockThreshold || 5) < 0) {
      return res.status(400).json({ success: false, message: 'Quantity and low stock threshold cannot be negative.' });
    }

    const product = await Product.create({
      name,
      categoryId,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
      buyingPrice: parseFloat(buyingPrice),
      sellingPrice: parseFloat(sellingPrice),
      quantity: parseInt(quantity || 0),
      lowStockThreshold: parseInt(lowStockThreshold || 5)
    });

    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: Category }]
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: fullProduct
    });
  } catch (error) {
    next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const { name, categoryId, description, image, buyingPrice, sellingPrice, quantity, lowStockThreshold } = req.body;

    if (sellingPrice !== undefined && parseFloat(sellingPrice) <= 0) {
      return res.status(400).json({ success: false, message: 'Selling price must be greater than 0.' });
    }
    if (buyingPrice !== undefined && parseFloat(buyingPrice) <= 0) {
      return res.status(400).json({ success: false, message: 'Buying price must be greater than 0.' });
    }

    await product.update({
      name: name !== undefined ? name : product.name,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      description: description !== undefined ? description : product.description,
      image: image !== undefined ? image : product.image,
      buyingPrice: buyingPrice !== undefined ? parseFloat(buyingPrice) : product.buyingPrice,
      sellingPrice: sellingPrice !== undefined ? parseFloat(sellingPrice) : product.sellingPrice,
      quantity: quantity !== undefined ? parseInt(quantity) : product.quantity,
      lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : product.lowStockThreshold
    });

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Category }]
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
