import * as XLSX from 'xlsx';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import {
  Product,
  Category,
  Subcategory,
  ProductImage,
  ProductVariant,
  Color,
  Size,
  BulkImport,
  AuditLog,
} from '../models/index.js';
import { BULK_IMPORT_STATUS } from '../models/BulkImport.js';
import { PRODUCT_STATUS } from '../models/Product.js';
import meiliService from './meiliService.js';
import queueService from './queueService.js';
import { QUEUE_NAMES } from '../config/queues.js';
import AppError from '../utils/customError.js';
import logger from '../config/logger.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export const bulkImportService = {
  /**
   * Generate Sample Excel Template for Bulk Product Import
   */
  generateTemplate() {
    const headers = [
      'Product Name*',
      'SKU*',
      'Category*',
      'Subcategory*',
      'MRP*',
      'Selling Price*',
      'Stock Quantity*',
      'Low Stock Threshold',
      'Short Description',
      'Full Description',
      'Brand',
      'Specifications',
      'Care Instructions',
      'Tags (comma separated)',
      'Primary Image URL',
      'Status (DRAFT/PUBLISHED/UNPUBLISHED)',
      'Weight (grams)',
      'Length (cm)',
      'Width (cm)',
      'Height (cm)',
      'Bulk Selling (TRUE/FALSE)',
      'Min Order Quantity (MOQ)',
      'Color Name',
      'Size Name',
    ];

    const sampleRows = [
      {
        'Product Name*': 'Gold Plated Floral Pendant Necklace',
        'SKU*': 'TP-JW-NCK-001',
        'Category*': 'Jewellery',
        'Subcategory*': 'Necklaces',
        'MRP*': 2499,
        'Selling Price*': 1799,
        'Stock Quantity*': 45,
        'Low Stock Threshold': 5,
        'Short Description': 'Elegant 18K gold plated floral pendant necklace with zircon crystals',
        'Full Description': 'Crafted with premium brass and dipped in 18K gold. Perfect for festive and casual occasions.',
        'Brand': 'ThePurple',
        'Specifications': 'Material: Brass, Finish: 18K Gold Plated, Stone: Cubic Zirconia',
        'Care Instructions': 'Keep away from moisture, perfumes and chemicals. Store in airtight box.',
        'Tags (comma separated)': 'jewellery, necklace, floral, gold, pendant',
        'Primary Image URL': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        'Status (DRAFT/PUBLISHED/UNPUBLISHED)': 'PUBLISHED',
        'Weight (grams)': 35,
        'Length (cm)': 15,
        'Width (cm)': 10,
        'Height (cm)': 3,
        'Bulk Selling (TRUE/FALSE)': 'FALSE',
        'Min Order Quantity (MOQ)': 1,
        'Color Name': 'Gold',
        'Size Name': 'Free Size',
      },
      {
        'Product Name*': 'Mini Teddy Bear Keychain Plushies (Pack)',
        'SKU*': 'TP-TOY-TED-001',
        'Category*': 'Teddy Bears & Plushies',
        'Subcategory*': 'Cute Keychain & Mini Plushies',
        'MRP*': 299,
        'Selling Price*': 149,
        'Stock Quantity*': 500,
        'Low Stock Threshold': 50,
        'Short Description': 'Wholesale mini plush teddy bear keychains for gifting and events',
        'Full Description': 'Soft fluffy mini teddy bear keychains. Minimum order quantity of 30 pieces applies.',
        'Brand': 'ThePurple',
        'Specifications': 'Material: Super soft plush, Filling: PP Cotton, Size: 10cm',
        'Care Instructions': 'Surface wash only.',
        'Tags (comma separated)': 'teddy bear, keychain, plushie, bulk, wholesale',
        'Primary Image URL': 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80',
        'Status (DRAFT/PUBLISHED/UNPUBLISHED)': 'PUBLISHED',
        'Weight (grams)': 40,
        'Length (cm)': 10,
        'Width (cm)': 8,
        'Height (cm)': 6,
        'Bulk Selling (TRUE/FALSE)': 'TRUE',
        'Min Order Quantity (MOQ)': 30,
        'Color Name': 'Brown',
        'Size Name': '10cm',
      },
      {
        'Product Name*': 'Silver Crystal Drop Earrings',
        'SKU*': 'TP-JW-EAR-002',
        'Category*': 'Jewellery',
        'Subcategory*': 'Earrings',
        'MRP*': 1499,
        'Selling Price*': 999,
        'Stock Quantity*': 60,
        'Low Stock Threshold': 10,
        'Short Description': 'Sparkling Austrian crystal drop earrings in sterling silver finish',
        'Full Description': 'Lightweight and hypoallergenic dangling earrings designed for evening parties.',
        'Brand': 'ThePurple',
        'Specifications': 'Material: Alloy, Finish: Silver Rhodium, Stone: Austrian Crystal',
        'Care Instructions': 'Wipe with soft cloth after every wear. Avoid spray perfumes.',
        'Tags (comma separated)': 'earrings, silver, crystals, partywear',
        'Primary Image URL': 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
        'Status (DRAFT/PUBLISHED/UNPUBLISHED)': 'PUBLISHED',
        'Weight (grams)': 20,
        'Length (cm)': 8,
        'Width (cm)': 6,
        'Height (cm)': 2,
        'Color Name': 'Silver',
        'Size Name': 'Standard',
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });

    // Set column widths
    const wscols = headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, 'Product Import Template');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  },

  /**
   * Parse uploaded Excel or CSV buffer to structured array of rows
   */
  parseFileBuffer(buffer) {
    try {
      const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
      const firstSheetName = wb.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('The uploaded file does not contain any sheets');
      }
      const ws = wb.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      return rows;
    } catch (err) {
      throw AppError.badRequest(`Failed to parse Excel/CSV file: ${err.message}`);
    }
  },

  /**
   * Validate uploaded rows against schema and database constraints
   */
  async validateRows(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      throw AppError.badRequest('The uploaded file contains no data rows');
    }

    const errors = [];
    const warnings = [];
    const validRows = [];
    const seenSkusInFile = new Set();

    // Cache existing Categories & Subcategories
    const categories = await Category.findAll({
      include: [{ model: Subcategory, as: 'subcategories' }],
    });

    const categoryMap = new Map();
    for (const cat of categories) {
      categoryMap.set(cat.name.toLowerCase().trim(), cat);
    }

    // Cache existing SKUs from DB
    const existingProducts = await Product.findAll({
      attributes: ['sku'],
      paranoid: false,
    });
    const dbSkuSet = new Set(existingProducts.map((p) => p.sku.toUpperCase().trim()));

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNumber = index + 2; // +1 for header, +1 for 1-indexing
      const rowErrors = [];

      // Extract fields with multiple possible header aliases
      const name = (row['Product Name*'] || row['Product Name'] || row['name'] || '').toString().trim();
      const sku = (row['SKU*'] || row['SKU'] || row['sku'] || '').toString().trim().toUpperCase();
      const categoryName = (row['Category*'] || row['Category'] || row['category'] || '').toString().trim();
      const subcategoryName = (row['Subcategory*'] || row['Subcategory'] || row['subcategory'] || '').toString().trim();
      const mrpRaw = row['MRP*'] || row['MRP'] || row['price'] || row['Price'] || '';
      const salePriceRaw = row['Selling Price*'] || row['Selling Price'] || row['salePrice'] || row['Sale Price'] || '';
      const stockRaw = row['Stock Quantity*'] || row['Stock Quantity'] || row['Stock'] || row['stock'] || '0';
      const lowStockRaw = row['Low Stock Threshold'] || row['lowStockThreshold'] || '5';
      const shortDescription = (row['Short Description'] || row['shortDescription'] || '').toString().trim();
      const description = (row['Full Description'] || row['Description'] || row['description'] || '').toString().trim();
      const brand = (row['Brand'] || row['brand'] || 'ThePurple').toString().trim();
      const specifications = (row['Specifications'] || row['specifications'] || '').toString().trim();
      const careInstructions = (row['Care Instructions'] || row['careInstructions'] || '').toString().trim();
      const tagsRaw = (row['Tags (comma separated)'] || row['Tags'] || row['tags'] || '').toString();
      const primaryImageUrl = (row['Primary Image URL'] || row['imageUrl'] || row['Image URL'] || '').toString().trim();
      const statusRaw = (row['Status (DRAFT/PUBLISHED/UNPUBLISHED)'] || row['Status'] || row['status'] || 'DRAFT').toString().trim().toUpperCase();
      const weightRaw = row['Weight (grams)'] || row['weightGrams'] || '';
      const lengthRaw = row['Length (cm)'] || row['lengthCm'] || '';
      const widthRaw = row['Width (cm)'] || row['widthCm'] || '';
      const heightRaw = row['Height (cm)'] || row['heightCm'] || '';
      const isBulkRaw = (row['Bulk Selling (TRUE/FALSE)'] || row['Bulk Selling'] || row['isBulk'] || row['is_bulk'] || '').toString().trim().toUpperCase();
      const isBulk = isBulkRaw === 'TRUE' || isBulkRaw === '1' || isBulkRaw === 'YES';
      const minOrderRaw = row['Min Order Quantity (MOQ)'] || row['Min Order Quantity'] || row['minOrderQuantity'] || row['min_order_quantity'] || '1';
      const minOrderQuantity = Math.max(1, parseInt(minOrderRaw, 10) || 1);
      const colorName = (row['Color Name'] || row['Color'] || row['color'] || '').toString().trim();
      const sizeName = (row['Size Name'] || row['Size'] || row['size'] || '').toString().trim();

      // Required field checks
      if (!name) rowErrors.push('Product Name is required');
      if (!sku) rowErrors.push('SKU is required');
      if (!categoryName) rowErrors.push('Category is required');
      if (!subcategoryName) rowErrors.push('Subcategory is required');

      // SKU uniqueness validation
      if (sku) {
        if (seenSkusInFile.has(sku)) {
          rowErrors.push(`Duplicate SKU "${sku}" found within the uploaded file`);
        } else {
          seenSkusInFile.add(sku);
        }

        if (dbSkuSet.has(sku)) {
          rowErrors.push(`SKU "${sku}" already exists in the database`);
        }
      }

      // Category & Subcategory resolution
      let matchedCategory = null;
      let matchedSubcategory = null;

      if (categoryName) {
        matchedCategory = categoryMap.get(categoryName.toLowerCase());
        if (!matchedCategory) {
          rowErrors.push(`Category "${categoryName}" does not exist`);
        } else if (subcategoryName) {
          matchedSubcategory = matchedCategory.subcategories?.find(
            (s) => s.name.toLowerCase().trim() === subcategoryName.toLowerCase()
          );
          if (!matchedSubcategory) {
            rowErrors.push(`Subcategory "${subcategoryName}" does not belong to category "${categoryName}"`);
          }
        }
      }

      // Pricing validation
      const mrp = parseFloat(mrpRaw);
      const salePrice = salePriceRaw !== '' ? parseFloat(salePriceRaw) : mrp;

      if (isNaN(mrp) || mrp < 0) {
        rowErrors.push('MRP must be a valid positive number');
      }
      if (isNaN(salePrice) || salePrice < 0) {
        rowErrors.push('Selling Price must be a valid positive number');
      }
      if (!isNaN(mrp) && !isNaN(salePrice) && salePrice > mrp) {
        rowErrors.push(`Selling Price (${salePrice}) cannot exceed MRP (${mrp})`);
      }

      // Stock validation
      const stock = parseInt(stockRaw, 10);
      if (isNaN(stock) || stock < 0) {
        rowErrors.push('Stock Quantity must be a valid non-negative integer');
      }

      // Status validation
      let status = PRODUCT_STATUS.DRAFT;
      if (statusRaw && Object.values(PRODUCT_STATUS).includes(statusRaw)) {
        status = statusRaw;
      } else if (statusRaw) {
        warnings.push({ row: rowNumber, sku, warning: `Unrecognized status "${statusRaw}", defaulting to DRAFT` });
      }

      if (rowErrors.length > 0) {
        errors.push({
          row: rowNumber,
          sku: sku || 'N/A',
          productName: name || 'N/A',
          messages: rowErrors,
        });
      } else {
        const tags = tagsRaw
          ? tagsRaw
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        validRows.push({
          rowNumber,
          name,
          sku,
          slug: slugify(name),
          subcategoryId: matchedSubcategory.id,
          price: mrp,
          salePrice,
          discountPercent: mrp > 0 ? Math.round(((mrp - salePrice) / mrp) * 100) : 0,
          stock,
          lowStockThreshold: parseInt(lowStockRaw, 10) || 5,
          shortDescription: shortDescription || null,
          description: description || null,
          brand: brand || 'ThePurple',
          specifications: specifications || null,
          careInstructions: careInstructions || null,
          tags,
          primaryImageUrl: primaryImageUrl || null,
          status,
          weightGrams: weightRaw ? parseFloat(weightRaw) : null,
          lengthCm: lengthRaw ? parseFloat(lengthRaw) : null,
          widthCm: widthRaw ? parseFloat(widthRaw) : null,
          heightCm: heightRaw ? parseFloat(heightRaw) : null,
          isBulk,
          minOrderQuantity: isBulk ? minOrderQuantity : 1,
          colorName: colorName || null,
          sizeName: sizeName || null,
        });
      }
    }

    return {
      totalRows: rows.length,
      validCount: validRows.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings,
      validRows,
    };
  },

  /**
   * Process and insert a batch of valid product rows into database & Meilisearch
   */
  async processImportBatch(validRows, bulkImportId, adminId) {
    const bulkImport = await BulkImport.findByPk(bulkImportId);
    if (!bulkImport) throw new Error('BulkImport record not found');

    await bulkImport.update({
      status: BULK_IMPORT_STATUS.PROCESSING,
      processedRows: 0,
      createdCount: 0,
      failedCount: 0,
    });

    let createdCount = 0;
    let failedCount = 0;
    const batchErrors = [];
    const productsToSearchIndex = [];

    // Pre-cache Colors and Sizes
    const allColors = await Color.findAll();
    const colorMap = new Map(allColors.map((c) => [c.name.toLowerCase().trim(), c.id]));

    const allSizes = await Size.findAll();
    const sizeMap = new Map(allSizes.map((s) => [s.name.toLowerCase().trim(), s.id]));

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const transaction = await sequelize.transaction();

      try {
        let finalSlug = row.slug;
        const existingSlug = await Product.findOne({ where: { slug: finalSlug } });
        if (existingSlug) {
          finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}-${i}`;
        }

        const product = await Product.create(
          {
            name: row.name,
            sku: row.sku,
            slug: finalSlug,
            subcategoryId: row.subcategoryId,
            shortDescription: row.shortDescription,
            description: row.description,
            brand: row.brand,
            specifications: row.specifications,
            careInstructions: row.careInstructions,
            price: row.price,
            salePrice: row.salePrice,
            discountPercent: row.discountPercent,
            stock: row.stock,
            lowStockThreshold: row.lowStockThreshold,
            status: row.status,
            publishedAt: row.status === PRODUCT_STATUS.PUBLISHED ? new Date() : null,
            isActive: row.status === PRODUCT_STATUS.PUBLISHED,
            isBulk: Boolean(row.isBulk),
            minOrderQuantity: row.minOrderQuantity || 1,
            seoTitle: row.name,
            seoDescription: row.shortDescription || row.name,
            tags: row.tags,
            weightGrams: row.weightGrams,
            lengthCm: row.lengthCm,
            widthCm: row.widthCm,
            heightCm: row.heightCm,
          },
          { transaction }
        );

        // Add primary image if provided
        if (row.primaryImageUrl) {
          await ProductImage.create(
            {
              productId: product.id,
              imageUrl: row.primaryImageUrl,
              isPrimary: true,
              displayOrder: 0,
              altText: product.name,
            },
            { transaction }
          );
        }

        // Add variant if color or size provided
        if (row.colorName || row.sizeName) {
          let colorId = null;
          let sizeId = null;

          if (row.colorName && colorMap.has(row.colorName.toLowerCase())) {
            colorId = colorMap.get(row.colorName.toLowerCase());
          }
          if (row.sizeName && sizeMap.has(row.sizeName.toLowerCase())) {
            sizeId = sizeMap.get(row.sizeName.toLowerCase());
          }

          await ProductVariant.create(
            {
              productId: product.id,
              sku: `${product.sku}-VAR`,
              colorId,
              sizeId,
              name: `${product.name} ${row.colorName || ''} ${row.sizeName || ''}`.trim(),
              mrp: product.price,
              salePrice: product.salePrice,
              stock: product.stock,
              imageUrl: row.primaryImageUrl || null,
              isActive: true,
              displayOrder: 0,
            },
            { transaction }
          );
        }

        await transaction.commit();
        createdCount++;
        productsToSearchIndex.push(product.id);
      } catch (err) {
        await transaction.rollback();
        failedCount++;
        batchErrors.push({ row: row.rowNumber, sku: row.sku, error: err.message });
      }

      // Update progress every 20 rows or on last row
      if ((i + 1) % 20 === 0 || i === validRows.length - 1) {
        await bulkImport.update({
          processedRows: i + 1,
          createdCount,
          failedCount,
        });
      }
    }

    // Determine final status
    let finalStatus = BULK_IMPORT_STATUS.COMPLETED;
    if (failedCount > 0 && createdCount === 0) {
      finalStatus = BULK_IMPORT_STATUS.FAILED;
    } else if (failedCount > 0) {
      finalStatus = BULK_IMPORT_STATUS.PARTIALLY_COMPLETED;
    }

    await bulkImport.update({
      status: finalStatus,
      createdCount,
      failedCount,
      errors: batchErrors,
    });

    // Record Audit Log
    await AuditLog.create({
      adminId,
      action: 'BULK_IMPORT_COMPLETED',
      entity: 'BulkImport',
      entityId: bulkImport.id,
      metadata: { total: validRows.length, created: createdCount, failed: failedCount, status: finalStatus },
    });

    // Index created products to Meilisearch in background
    if (productsToSearchIndex.length > 0) {
      this.batchIndexToMeilisearch(productsToSearchIndex).catch((err) => {
        logger.warn(`Meilisearch batch sync error: ${err.message}`);
      });
    }

    return {
      status: finalStatus,
      createdCount,
      failedCount,
      errors: batchErrors,
    };
  },

  /**
   * Batch index an array of product IDs into Meilisearch
   */
  async batchIndexToMeilisearch(productIds) {
    try {
      const products = await Product.findAll({
        where: { id: { [Op.in]: productIds } },
        include: [
          {
            model: Subcategory,
            as: 'subcategory',
            include: [{ model: Category, as: 'category' }],
          },
          { model: ProductImage, as: 'images' },
        ],
      });

      const docs = products.map((p) => {
        const primaryImage = p.images?.find((img) => img.isPrimary) || p.images?.[0];
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          shortDescription: p.shortDescription,
          description: p.description,
          price: parseFloat(p.price),
          salePrice: parseFloat(p.salePrice),
          discountPercent: p.discountPercent,
          stock: p.stock,
          rating: parseFloat(p.rating || 0),
          reviewCount: p.reviewCount || 0,
          status: p.status,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller,
          tags: p.tags || [],
          category: p.subcategory?.category?.name || '',
          subcategory: p.subcategory?.name || '',
          imageUrl: primaryImage?.imageUrl || '',
          createdAt: p.createdAt?.toISOString(),
        };
      });

      await meiliService.indexProducts(docs);
      logger.info(`Meilisearch indexed ${docs.length} bulk imported products successfully`);
    } catch (err) {
      logger.warn(`Meilisearch bulk indexing failed: ${err.message}`);
    }
  },
};

export default bulkImportService;
