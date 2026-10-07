const ExcelJS = require('exceljs');
const { Product, Category, StockHistory } = require('../models');
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

    const initQty = parseInt(quantity || 0);
    const numBuyingPrice = parseFloat(buyingPrice);

    const product = await Product.create({
      name,
      categoryId,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60',
      buyingPrice: numBuyingPrice,
      sellingPrice: parseFloat(sellingPrice),
      quantity: initQty,
      lowStockThreshold: parseInt(lowStockThreshold || 5)
    });

    // If initial quantity > 0, log in StockHistory so it automatically shows in Purchases & Purchase Transactions
    if (initQty > 0) {
      await StockHistory.create({
        productId: product.id,
        retailerId: req.user ? req.user.id : 2,
        previousQuantity: 0,
        addedQuantity: initQty,
        newQuantity: initQty,
        previousBuyingPrice: 0.00,
        newBuyingPrice: numBuyingPrice,
        averageBuyingPrice: numBuyingPrice
      });
    }

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


// Download Excel Template for Bulk Product Import
const downloadTemplate = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NEC Store Admin';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Products', {
      views: [{ showGridLines: true }]
    });

    worksheet.columns = [
      { header: 'Product Name *', key: 'name', width: 36 },
      { header: 'Category *', key: 'category', width: 22 },
      { header: 'Distributor / Supplier', key: 'supplier', width: 32 },
      { header: 'Buying Price (₹)', key: 'buyingPrice', width: 18 },
      { header: 'Selling Price (₹) *', key: 'sellingPrice', width: 20 },
      { header: 'Quantity (Stock)', key: 'quantity', width: 18 },
      { header: 'Low Stock Threshold', key: 'lowStockThreshold', width: 22 },
      { header: 'Description', key: 'description', width: 45 },
      { header: 'Image URL', key: 'image', width: 55 }
    ];

    // Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' } // Deep Royal Blue
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });

    // Sample data rows with realistic distributors
    const sampleRows = [
      {
        name: 'Classmate Octane Gel Pen (Pack of 5)',
        category: 'Stationery',
        supplier: 'ITC Classmate Direct Wholesale',
        buyingPrice: 45.00,
        sellingPrice: 60.00,
        quantity: 50,
        lowStockThreshold: 10,
        description: 'Smooth waterproof gel pens for exam and note-taking',
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500'
      },
      {
        name: 'Casio Scientific Calculator FX-991CW',
        category: 'Electronics',
        supplier: 'Casio India Authorized Distributor',
        buyingPrice: 1350.00,
        sellingPrice: 1550.00,
        quantity: 20,
        lowStockThreshold: 5,
        description: 'Non-programmable scientific calculator with high definition display',
        image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500'
      },
      {
        name: 'Higher Engineering Mathematics - B.S. Grewal',
        category: 'Books',
        supplier: 'National Academic Press & Book Hub',
        buyingPrice: 650.00,
        sellingPrice: 780.00,
        quantity: 15,
        lowStockThreshold: 4,
        description: 'Comprehensive mathematics reference textbook for engineering students',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'
      },
      {
        name: 'NEC Campus Identity Lanyard & Badge Holder',
        category: 'Accessories',
        supplier: 'Campus Apparel & Lifestyle Wholesalers',
        buyingPrice: 25.00,
        sellingPrice: 40.00,
        quantity: 120,
        lowStockThreshold: 20,
        description: 'Durable nylon neck ribbon lanyard with clear ID card casing',
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500'
      }
    ];

    sampleRows.forEach((item) => {
      const row = worksheet.addRow(item);
      row.height = 24;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 || colNumber === 7 || colNumber === 8 ? 'left' : 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="NEC_Store_Product_Import_Template.xlsx"');
    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error generating template:', error);
    next(error);
  }
};

// Bulk Import Products from Excel (.xlsx) or JSON
const bulkImportProducts = async (req, res, next) => {
  try {
    const { fileBase64, items } = req.body;

    let rowsToProcess = [];

    if (Array.isArray(items) && items.length > 0) {
      rowsToProcess = items;
    } else if (fileBase64) {
      // Decode base64 buffer
      const base64Data = fileBase64.replace(/^data:.*?;base64,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet || worksheet.rowCount < 2) {
        return res.status(400).json({
          success: false,
          message: 'The uploaded Excel file does not contain any product rows.'
        });
      }

      // Read header mapping
      const headerRow = worksheet.getRow(1);
      const colMap = {};
      headerRow.eachCell((cell, colNumber) => {
        const cleanHeader = String(cell.value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, ' ');
        if (!cleanHeader) return;

        // 1. Photo / Image URL mapping
        if (cleanHeader.includes('new photo') || cleanHeader.includes('new image') || cleanHeader.includes('new url') || cleanHeader.includes('photo') || cleanHeader.includes('image') || cleanHeader.includes('picture') || cleanHeader.includes('img') || cleanHeader.includes('url')) {
          if (!colMap.image || cleanHeader.includes('new')) {
            colMap.image = colNumber;
          }
        }
        // 2. Low Stock Alert
        else if (cleanHeader.includes('thresh') || cleanHeader.includes('low stock') || cleanHeader.includes('min stock') || cleanHeader.includes('alert')) {
          colMap.lowStockThreshold = colNumber;
        }
        // 3. Quantity / Stock Units
        else if (cleanHeader.includes('quant') || cleanHeader.includes('qty') || cleanHeader.includes('stock') || cleanHeader.includes('units') || cleanHeader.includes('count')) {
          colMap.quantity = colNumber;
        }
        // 4. Buying Price / Cost Price
        else if (cleanHeader.includes('buy') || cleanHeader.includes('cost') || cleanHeader.includes('purchase rate') || cleanHeader.includes('cp')) {
          colMap.buyingPrice = colNumber;
        }
        // 5. Selling Price / Retail MRP
        else if (cleanHeader.includes('sell') || cleanHeader.includes('mrp') || cleanHeader.includes('retail') || cleanHeader.includes('sp') || cleanHeader.includes('price') || cleanHeader.includes('rate')) {
          colMap.sellingPrice = colNumber;
        }
        // 6. Supplier / Distributor
        else if (cleanHeader.includes('suppl') || cleanHeader.includes('distrib') || cleanHeader.includes('vendor') || cleanHeader.includes('dealer') || cleanHeader.includes('from')) {
          colMap.supplier = colNumber;
        }
        // 7. Category
        else if (cleanHeader.includes('cat') || cleanHeader.includes('type') || cleanHeader.includes('department')) {
          colMap.category = colNumber;
        }
        // 8. Description
        else if (cleanHeader.includes('desc') || cleanHeader.includes('detail') || cleanHeader.includes('note')) {
          colMap.description = colNumber;
        }
        // 9. Product ID
        else if (cleanHeader === 'id' || cleanHeader.includes('product id') || cleanHeader.includes('item id') || cleanHeader.includes('code') || cleanHeader.includes('sku')) {
          colMap.productId = colNumber;
        }
        // 10. Product Name
        else if (cleanHeader.includes('name') || cleanHeader.includes('title') || cleanHeader.includes('product') || cleanHeader.includes('item')) {
          if (!colMap.name) {
            colMap.name = colNumber;
          }
        }
      });

      // Positional fallbacks only if not mapped at all
      if (!colMap.name && !colMap.productId) colMap.name = 1;
      if (!colMap.category && headerRow.cellCount >= 2 && !colMap.image) colMap.category = 2;

      const getCellValue = (row, colIndex) => {
        if (!colIndex) return '';
        const cell = row.getCell(colIndex);
        if (!cell || cell.value === null || cell.value === undefined) return '';
        if (typeof cell.value === 'object') {
          if (cell.value.hyperlink) return String(cell.value.hyperlink).trim();
          if (cell.value.text) return String(cell.value.text).trim();
          if (cell.value.result !== undefined) return String(cell.value.result).trim();
          if (cell.value.richText) return cell.value.richText.map(t => t.text).join('').trim();
        }
        return String(cell.value).trim();
      };

      for (let r = 2; r <= worksheet.rowCount; r++) {
        const row = worksheet.getRow(r);
        const nameVal = String(getCellValue(row, colMap.name) || '').trim();
        const idVal = getCellValue(row, colMap.productId);
        const imageVal = String(getCellValue(row, colMap.image) || '').trim();
        const sellingPriceVal = getCellValue(row, colMap.sellingPrice);

        // If entire row has neither id, name, price nor image, skip
        if (!nameVal && !idVal && !sellingPriceVal && !imageVal) continue;

        rowsToProcess.push({
          rowNumber: r,
          productId: idVal,
          name: nameVal,
          category: String(getCellValue(row, colMap.category) || '').trim(),
          supplier: String(getCellValue(row, colMap.supplier) || '').trim(),
          buyingPrice: getCellValue(row, colMap.buyingPrice),
          sellingPrice: sellingPriceVal,
          quantity: getCellValue(row, colMap.quantity),
          lowStockThreshold: getCellValue(row, colMap.lowStockThreshold),
          description: String(getCellValue(row, colMap.description) || '').trim(),
          image: imageVal
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'No Excel file or items provided for import.'
      });
    }

    if (rowsToProcess.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid data rows found in the uploaded file.'
      });
    }

    // Default fallback category images if empty
    const categoryDefaultImages = {
      'Stationery': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500',
      'Electronics': 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500',
      'Books': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      'Accessories': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500',
      'College Essentials': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
      'Uniform': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500',
      'Snacks & Beverages': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500'
    };

    const categoriesCache = {};
    const allCategories = await Category.findAll();
    allCategories.forEach(c => {
      categoriesCache[c.name.toLowerCase()] = c;
    });

    let createdCount = 0;
    let updatedCount = 0;
    const errors = [];
    const importedProducts = [];

    for (const item of rowsToProcess) {
      const rowNum = item.rowNumber || 'N/A';
      const trimmedName = String(item.name || '').trim();
      const numId = parseInt(item.productId);

      if (!trimmedName && isNaN(numId)) {
        errors.push({ row: rowNum, error: 'Product name or ID is required.' });
        continue;
      }

      // Find existing product by ID or Name (case-insensitive & trimmed)
      let existing = null;
      if (!isNaN(numId) && numId > 0) {
        existing = await Product.findByPk(numId);
      }
      if (!existing && trimmedName) {
        existing = await Product.findOne({
          where: { name: trimmedName }
        });
        if (!existing) {
          existing = await Product.findOne({
            where: sequelize.where(
              sequelize.fn('LOWER', sequelize.fn('TRIM', sequelize.col('Product.name'))),
              trimmedName.toLowerCase()
            )
          });
        }
      }

      // Parse numerical fields
      const rawSelling = parseFloat(item.sellingPrice);
      const hasValidSelling = !isNaN(rawSelling) && rawSelling >= 0;

      const rawBuying = parseFloat(item.buyingPrice);
      const hasValidBuying = !isNaN(rawBuying) && rawBuying >= 0;

      const rawQty = parseInt(item.quantity);
      const hasValidQty = !isNaN(rawQty) && rawQty > 0;

      const rawThreshold = parseInt(item.lowStockThreshold);
      const hasValidThreshold = !isNaN(rawThreshold) && rawThreshold >= 0;

      // Resolve Category if provided
      let category = null;
      const catName = (item.category || '').trim();
      if (catName) {
        category = categoriesCache[catName.toLowerCase()];
        if (!category) {
          const [newCat] = await Category.findOrCreate({
            where: { name: catName },
            defaults: { name: catName, description: catName + ' items category' }
          });
          category = newCat;
          categoriesCache[catName.toLowerCase()] = category;
        }
      }

      if (existing) {
        // --- UPDATE EXISTING PRODUCT ---
        const updateFields = {};

        // 1. Update Image if provided (clean URL)
        if (item.image && typeof item.image === 'string' && item.image.trim().length > 5) {
          updateFields.image = item.image.trim();
        }

        // 2. Update Selling Price if provided
        if (hasValidSelling) {
          updateFields.sellingPrice = rawSelling;
        }

        // 3. Update Category if provided
        if (category) {
          updateFields.categoryId = category.id;
        }

        // 4. Update Description if provided
        if (item.description && item.description.trim().length > 0) {
          updateFields.description = item.description.trim();
        }

        // 5. Update Low Stock Threshold if provided
        if (hasValidThreshold) {
          updateFields.lowStockThreshold = rawThreshold;
        }

        // 6. Update Quantity & Buying Price if incoming quantity > 0
        if (hasValidQty) {
          const prevQty = existing.quantity || 0;
          const prevBuyingPrice = parseFloat(existing.buyingPrice) || 0;
          const newQty = prevQty + rawQty;
          const finalBuyingPrice = hasValidBuying ? rawBuying : prevBuyingPrice;

          const weightedAvgPrice = prevQty === 0
            ? finalBuyingPrice
            : ((prevQty * prevBuyingPrice) + (rawQty * finalBuyingPrice)) / (newQty || 1);

          updateFields.quantity = newQty;
          updateFields.buyingPrice = parseFloat(weightedAvgPrice.toFixed(2));

          await StockHistory.create({
            productId: existing.id,
            retailerId: req.user ? req.user.id : 2,
            previousQuantity: prevQty,
            addedQuantity: rawQty,
            newQuantity: newQty,
            previousBuyingPrice: prevBuyingPrice,
            newBuyingPrice: finalBuyingPrice,
            averageBuyingPrice: parseFloat(weightedAvgPrice.toFixed(2)),
            supplier: item.supplier || 'Bulk Import Distributor'
          });
        } else if (hasValidBuying) {
          updateFields.buyingPrice = rawBuying;
        }

        // Execute update on existing product
        await existing.update(updateFields);
        updatedCount++;
        importedProducts.push(existing);

      } else {
        // --- CREATE NEW PRODUCT ---
        if (!hasValidSelling) {
          errors.push({
            row: rowNum,
            name: trimmedName,
            error: 'Selling price is required for new product "' + trimmedName + '".'
          });
          continue;
        }

        const defaultCat = category || categoriesCache['stationery'] || allCategories[0];
        const catId = defaultCat ? defaultCat.id : 1;
        const catNameStr = defaultCat ? defaultCat.name : 'Stationery';

        const finalImage = (item.image && item.image.trim().length > 5)
          ? item.image.trim()
          : (categoryDefaultImages[catNameStr] || categoryDefaultImages['Stationery']);

        const numBuyingPrice = hasValidBuying ? rawBuying : 0.00;
        const numQuantity = hasValidQty ? rawQty : 0;
        const numThreshold = hasValidThreshold ? rawThreshold : 5;

        const newProd = await Product.create({
          name: trimmedName,
          categoryId: catId,
          buyingPrice: numBuyingPrice,
          sellingPrice: rawSelling,
          quantity: numQuantity,
          lowStockThreshold: numThreshold,
          description: item.description || (trimmedName + ' for NEC campus store'),
          image: finalImage
        });

        if (numQuantity > 0) {
          await StockHistory.create({
            productId: newProd.id,
            retailerId: req.user ? req.user.id : 2,
            previousQuantity: 0,
            addedQuantity: numQuantity,
            newQuantity: numQuantity,
            previousBuyingPrice: 0.00,
            newBuyingPrice: numBuyingPrice,
            averageBuyingPrice: numBuyingPrice,
            supplier: item.supplier || 'Bulk Import Distributor'
          });
        }

        createdCount++;
        importedProducts.push(newProd);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Bulk import completed! ' + createdCount + ' product(s) added, ' + updatedCount + ' existing product(s) updated.',
      summary: {
        totalRows: rowsToProcess.length,
        createdCount,
        updatedCount,
        failedCount: errors.length
      },
      errors
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    next(error);
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  downloadTemplate,
  bulkImportProducts
};
