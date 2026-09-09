import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import {
  Product,
  ProductImage,
  ProductVariant,
  Category,
  Subcategory,
  Color,
  Size,
  Attribute,
  AttributeValue,
  ProductAttributeValue,
  AuditLog,
} from '../../models/index.js';
import { PRODUCT_STATUS } from '../../models/Product.js';
import meiliService from '../../services/meiliService.js';
import AppError from '../../utils/customError.js';
import logger from '../../config/logger.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export const productService = {
  /**
   * List products with server-side pagination, search, filters, and sorting
   */
  async listProducts({
    page = 1,
    limit = 20,
    search,
    categoryId,
    subcategoryId,
    status,
    stockStatus,
    minPrice,
    maxPrice,
    sort = 'newest',
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    const subcategoryWhere = {};

    // Search by Name or SKU
    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: q } },
        { sku: { [Op.iLike]: q } },
      ];
    }

    // Filter by Subcategory or Category
    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    } else if (categoryId) {
      subcategoryWhere.categoryId = categoryId;
    }

    // Filter by Status
    if (status && Object.values(PRODUCT_STATUS).includes(status)) {
      where.status = status;
    }

    // Filter by Stock Status
    if (stockStatus) {
      if (stockStatus === 'in_stock') {
        where.stock = { [Op.gt]: sequelize.col('Product.lowStockThreshold') };
      } else if (stockStatus === 'low_stock') {
        where[Op.and] = [
          { stock: { [Op.gt]: 0 } },
          sequelize.where(sequelize.col('Product.stock'), '<=', sequelize.col('Product.lowStockThreshold')),
        ];
      } else if (stockStatus === 'out_of_stock') {
        where.stock = { [Op.lte]: 0 };
      }
    }

    // Filter by Price Range
    if (minPrice !== undefined && minPrice !== '') {
      where.salePrice = { ...(where.salePrice || {}), [Op.gte]: parseFloat(minPrice) };
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      where.salePrice = { ...(where.salePrice || {}), [Op.lte]: parseFloat(maxPrice) };
    }

    // Sort order
    let order = [['createdAt', 'DESC']];
    if (sort === 'oldest') order = [['createdAt', 'ASC']];
    if (sort === 'price_asc') order = [['salePrice', 'ASC']];
    if (sort === 'price_desc') order = [['salePrice', 'DESC']];
    if (sort === 'name_asc') order = [['name', 'ASC']];
    if (sort === 'stock_desc') order = [['stock', 'DESC']];
    if (sort === 'stock_asc') order = [['stock', 'ASC']];

    const subInclude = {
      model: Subcategory,
      as: 'subcategory',
      where: Object.keys(subcategoryWhere).length > 0 ? subcategoryWhere : undefined,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      attributes: ['id', 'name', 'slug', 'categoryId'],
    };

    const [count, rows] = await Promise.all([
      Product.count({
        where,
        include: Object.keys(subcategoryWhere).length > 0 ? [subInclude] : undefined,
        distinct: true,
      }),
      Product.findAll({
        where,
        attributes: [
          'id',
          'name',
          'sku',
          'slug',
          'brand',
          'price',
          'salePrice',
          'discountPercent',
          'stock',
          'lowStockThreshold',
          'status',
          'isActive',
          'isFeatured',
          'isBestSeller',
          'isBulk',
          'minOrderQuantity',
          'tags',
          'createdAt',
        ],
        include: [
          subInclude,
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'imageUrl', 'isPrimary', 'displayOrder'],
            required: false,
          },
        ],
        order,
        limit: limitNum,
        offset,
        subQuery: false,
      }),
    ]);

    return {
      products: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum) || 1,
      },
    };
  },

  /**
   * Get product by ID with full details
   */
  async getProductById(id) {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          include: [
            {
              model: Category,
              as: 'category',
            },
          ],
        },
        {
          model: ProductImage,
          as: 'images',
        },
        {
          model: ProductVariant,
          as: 'variants',
          include: [
            { model: Color, as: 'color' },
            { model: Size, as: 'size' },
          ],
        },
        {
          model: AttributeValue,
          as: 'attributeValues',
          include: [{ model: Attribute, as: 'attribute' }],
        },
      ],
      order: [
        [{ model: ProductImage, as: 'images' }, 'isPrimary', 'DESC'],
        [{ model: ProductImage, as: 'images' }, 'displayOrder', 'ASC'],
        [{ model: ProductVariant, as: 'variants' }, 'displayOrder', 'ASC'],
      ],
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    return product;
  },

  /**
   * Create single product with all 11 sections
   */
  async createProduct({
    name,
    title,
    sku,
    slug,
    categoryId,
    subcategoryId,
    shortDescription,
    description,
    brand = 'ThePurple',
    specifications,
    careInstructions,
    price,
    regularPrice,
    salePrice,
    sellingPrice,
    discountPercent,
    taxRate = 0,
    hsnCode,
    stock = 0,
    stockQuantity,
    lowStockThreshold = 5,
    status = PRODUCT_STATUS.DRAFT,
    seoTitle,
    seoDescription,
    seoKeywords,
    weightGrams,
    lengthCm,
    widthCm,
    heightCm,
    tags = [],
    isFeatured = false,
    isBestSeller = false,
    isBulk = false,
    minOrderQuantity = 1,
    images = [],
    variants = [],
    attributeValueIds = [],
    colorIds = [],
    sizeIds = [],
    adminId,
    ipAddress,
  }) {
    const finalName = (name || title || '').trim();
    if (!finalName) throw AppError.badRequest('Product name/title is required');
    if (!sku || !sku.trim()) throw AppError.badRequest('SKU is required');

    let resolvedSubcategoryId = subcategoryId;
    if (!resolvedSubcategoryId && categoryId) {
      const existingSub = await Subcategory.findOne({ where: { categoryId } });
      if (existingSub) {
        resolvedSubcategoryId = existingSub.id;
      } else {
        const cat = await Category.findByPk(categoryId);
        if (cat) {
          const newSub = await Subcategory.create({
            categoryId: cat.id,
            name: `${cat.name} General`,
            slug: `${cat.slug}-general`,
            isActive: true,
          });
          resolvedSubcategoryId = newSub.id;
        }
      }
    }

    if (!resolvedSubcategoryId) throw AppError.badRequest('Subcategory or Category is required');

    const rawPrice = price !== undefined && price !== '' ? price : regularPrice;
    const rawSalePrice = salePrice !== undefined && salePrice !== '' ? salePrice : sellingPrice;

    const numPrice = parseFloat(rawPrice);
    const numSalePrice = rawSalePrice !== undefined && rawSalePrice !== '' ? parseFloat(rawSalePrice) : numPrice;

    if (isNaN(numPrice) || numPrice < 0) throw AppError.badRequest('Price (MRP) must be a positive number');
    if (isNaN(numSalePrice) || numSalePrice < 0) throw AppError.badRequest('Sale price must be a positive number');
    if (numSalePrice > numPrice) {
      throw AppError.badRequest(`Selling price (${numSalePrice}) cannot exceed MRP (${numPrice})`);
    }

    const calculatedDiscount = numPrice > 0 ? Math.round(((numPrice - numSalePrice) / numPrice) * 100) : 0;
    const finalStock = stockQuantity !== undefined ? parseInt(stockQuantity, 10) || 0 : parseInt(stock, 10) || 0;

    // Verify subcategory exists
    const subcategory = await Subcategory.findByPk(resolvedSubcategoryId, {
      include: [{ model: Category, as: 'category' }],
    });
    if (!subcategory) {
      throw AppError.badRequest('Selected subcategory does not exist');
    }

    const cleanSku = sku.trim().toUpperCase();
    const existingSku = await Product.findOne({ where: { sku: cleanSku } });
    if (existingSku) {
      throw AppError.badRequest(`Product SKU "${cleanSku}" already exists`);
    }

    let finalSlug = slug && slug.trim() ? slugify(slug) : slugify(finalName);
    const existingSlug = await Product.findOne({ where: { slug: finalSlug }, paranoid: false });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const transaction = await sequelize.transaction();

    try {
      const product = await Product.create(
        {
          name: finalName,
          sku: cleanSku,
          slug: finalSlug,
          subcategoryId: resolvedSubcategoryId,
          shortDescription: shortDescription || null,
          description: description || null,
          brand: brand || 'ThePurple',
          specifications: specifications || null,
          careInstructions: careInstructions || null,
          price: numPrice,
          salePrice: numSalePrice,
          discountPercent: discountPercent !== undefined ? parseInt(discountPercent, 10) : calculatedDiscount,
          taxRate: taxRate ? parseFloat(taxRate) : 0,
          hsnCode: hsnCode || null,
          stock: finalStock,
          lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
          status,
          publishedAt: status === PRODUCT_STATUS.PUBLISHED ? new Date() : null,
          seoTitle: seoTitle || finalName,
          seoDescription: seoDescription || shortDescription || null,
          seoKeywords: seoKeywords || null,
          weightGrams: weightGrams ? parseFloat(weightGrams) : null,
          lengthCm: lengthCm ? parseFloat(lengthCm) : null,
          widthCm: widthCm ? parseFloat(widthCm) : null,
          heightCm: heightCm ? parseFloat(heightCm) : null,
          tags: Array.isArray(tags) ? tags : [],
          isFeatured: Boolean(isFeatured),
          isBestSeller: Boolean(isBestSeller),
          isBulk: Boolean(isBulk),
          minOrderQuantity: Boolean(isBulk) ? Math.max(1, parseInt(minOrderQuantity, 10) || 1) : 1,
          isActive: status === PRODUCT_STATUS.PUBLISHED,
        },
        { transaction }
      );

      // Create Images
      if (Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const imgUrl = typeof img === 'string' ? img : img.imageUrl;
          if (imgUrl) {
            await ProductImage.create(
              {
                productId: product.id,
                imageUrl: imgUrl,
                r2Key: typeof img === 'object' ? img.r2Key || null : null,
                altText: typeof img === 'object' ? img.altText || product.name : product.name,
                displayOrder: typeof img === 'object' && img.displayOrder !== undefined ? img.displayOrder : i,
                isPrimary: typeof img === 'object' && img.isPrimary !== undefined ? img.isPrimary : i === 0,
              },
              { transaction }
            );
          }
        }
      }

      // Create Variants
      if (Array.isArray(variants) && variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          if (v.sku) {
            await ProductVariant.create(
              {
                productId: product.id,
                sku: v.sku.trim().toUpperCase(),
                colorId: v.colorId || null,
                sizeId: v.sizeId || null,
                name: v.name || null,
                mrp: v.mrp ? parseFloat(v.mrp) : numPrice,
                salePrice: v.salePrice ? parseFloat(v.salePrice) : numSalePrice,
                stock: v.stock !== undefined ? parseInt(v.stock, 10) : 0,
                imageUrl: v.imageUrl || null,
                isActive: v.isActive !== undefined ? Boolean(v.isActive) : true,
                displayOrder: i,
              },
              { transaction }
            );
          }
        }
      }

      // Link Attributes
      if (Array.isArray(attributeValueIds) && attributeValueIds.length > 0) {
        for (const attrValId of attributeValueIds) {
          await ProductAttributeValue.create(
            {
              productId: product.id,
              attributeValueId: attrValId,
            },
            { transaction }
          );
        }
      }

      await transaction.commit();

      // Record Audit Log
      await AuditLog.create({
        adminId,
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: product.id,
        metadata: { name: product.name, sku: product.sku, status: product.status },
        ipAddress: ipAddress || null,
      });

      // Synchronize Meilisearch index asynchronously
      this.syncProductToMeilisearch(product.id).catch((err) => {
        logger.warn(`Background Meilisearch sync failed for product ${product.id}: ${err.message}`);
      });

      return await this.getProductById(product.id);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  /**
   * Update product
   */
  async updateProduct(
    id,
    {
      name,
      sku,
      slug,
      subcategoryId,
      shortDescription,
      description,
      brand,
      specifications,
      careInstructions,
      price,
      salePrice,
      discountPercent,
      taxRate,
      hsnCode,
      stock,
      lowStockThreshold,
      status,
      seoTitle,
      seoDescription,
      seoKeywords,
      weightGrams,
      lengthCm,
      widthCm,
      heightCm,
      tags,
      isFeatured,
      isBestSeller,
      isBulk,
      minOrderQuantity,
      images,
      variants,
      attributeValueIds,
      adminId,
      ipAddress,
    }
  ) {
    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound('Product not found');

    const updates = {};

    if (name) updates.name = name.trim();
    if (sku) {
      const cleanSku = sku.trim().toUpperCase();
      if (cleanSku !== product.sku) {
        const existing = await Product.findOne({
          where: { sku: cleanSku, id: { [Op.ne]: id } },
        });
        if (existing) throw AppError.badRequest(`SKU "${cleanSku}" is already used by another product`);
        updates.sku = cleanSku;
      }
    }

    if (slug) {
      const cleanSlug = slugify(slug);
      if (cleanSlug !== product.slug) {
        const existing = await Product.findOne({
          where: { slug: cleanSlug, id: { [Op.ne]: id } },
        });
        if (existing) throw AppError.badRequest(`Slug "${cleanSlug}" is already in use`);
        updates.slug = cleanSlug;
      }
    }

    if (subcategoryId) {
      const sub = await Subcategory.findByPk(subcategoryId);
      if (!sub) throw AppError.badRequest('Subcategory not found');
      updates.subcategoryId = subcategoryId;
    }

    const currentPrice = price !== undefined ? parseFloat(price) : parseFloat(product.price);
    const currentSalePrice =
      salePrice !== undefined ? parseFloat(salePrice) : parseFloat(product.salePrice);

    if (currentSalePrice > currentPrice) {
      throw AppError.badRequest(`Selling price (${currentSalePrice}) cannot exceed MRP (${currentPrice})`);
    }

    if (price !== undefined) updates.price = currentPrice;
    if (salePrice !== undefined) updates.salePrice = currentSalePrice;
    if (discountPercent !== undefined) {
      updates.discountPercent = parseInt(discountPercent, 10);
    } else if (price !== undefined || salePrice !== undefined) {
      updates.discountPercent =
        currentPrice > 0 ? Math.round(((currentPrice - currentSalePrice) / currentPrice) * 100) : 0;
    }

    if (shortDescription !== undefined) updates.shortDescription = shortDescription;
    if (description !== undefined) updates.description = description;
    if (brand !== undefined) updates.brand = brand;
    if (specifications !== undefined) updates.specifications = specifications;
    if (careInstructions !== undefined) updates.careInstructions = careInstructions;
    if (taxRate !== undefined) updates.taxRate = parseFloat(taxRate) || 0;
    if (hsnCode !== undefined) updates.hsnCode = hsnCode;
    if (stock !== undefined) updates.stock = parseInt(stock, 10);
    if (lowStockThreshold !== undefined) updates.lowStockThreshold = parseInt(lowStockThreshold, 10);

    if (status) {
      if (!Object.values(PRODUCT_STATUS).includes(status)) throw AppError.badRequest('Invalid status');
      updates.status = status;
      updates.isActive = status === PRODUCT_STATUS.PUBLISHED;
      if (status === PRODUCT_STATUS.PUBLISHED && !product.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    if (seoTitle !== undefined) updates.seoTitle = seoTitle;
    if (seoDescription !== undefined) updates.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updates.seoKeywords = seoKeywords;
    if (weightGrams !== undefined) updates.weightGrams = weightGrams ? parseFloat(weightGrams) : null;
    if (lengthCm !== undefined) updates.lengthCm = lengthCm ? parseFloat(lengthCm) : null;
    if (widthCm !== undefined) updates.widthCm = widthCm ? parseFloat(widthCm) : null;
    if (heightCm !== undefined) updates.heightCm = heightCm ? parseFloat(heightCm) : null;
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);
    if (isBestSeller !== undefined) updates.isBestSeller = Boolean(isBestSeller);
    if (isBulk !== undefined) updates.isBulk = Boolean(isBulk);
    if (minOrderQuantity !== undefined) updates.minOrderQuantity = Math.max(1, parseInt(minOrderQuantity, 10) || 1);

    const transaction = await sequelize.transaction();

    try {
      await product.update(updates, { transaction });

      // Update Images if provided
      if (Array.isArray(images)) {
        await ProductImage.destroy({ where: { productId: id }, transaction });
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const imgUrl = typeof img === 'string' ? img : img.imageUrl;
          if (imgUrl) {
            await ProductImage.create(
              {
                productId: id,
                imageUrl: imgUrl,
                r2Key: typeof img === 'object' ? img.r2Key || null : null,
                altText: typeof img === 'object' ? img.altText || product.name : product.name,
                displayOrder: typeof img === 'object' && img.displayOrder !== undefined ? img.displayOrder : i,
                isPrimary: typeof img === 'object' && img.isPrimary !== undefined ? img.isPrimary : i === 0,
              },
              { transaction }
            );
          }
        }
      }

      // Update Variants if provided
      if (Array.isArray(variants)) {
        await ProductVariant.destroy({ where: { productId: id }, transaction });
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          if (v.sku) {
            await ProductVariant.create(
              {
                productId: id,
                sku: v.sku.trim().toUpperCase(),
                colorId: v.colorId || null,
                sizeId: v.sizeId || null,
                name: v.name || null,
                mrp: v.mrp ? parseFloat(v.mrp) : currentPrice,
                salePrice: v.salePrice ? parseFloat(v.salePrice) : currentSalePrice,
                stock: v.stock !== undefined ? parseInt(v.stock, 10) : 0,
                imageUrl: v.imageUrl || null,
                isActive: v.isActive !== undefined ? Boolean(v.isActive) : true,
                displayOrder: i,
              },
              { transaction }
            );
          }
        }
      }

      // Update Attributes if provided
      if (Array.isArray(attributeValueIds)) {
        await ProductAttributeValue.destroy({ where: { productId: id }, transaction });
        for (const attrValId of attributeValueIds) {
          await ProductAttributeValue.create(
            { productId: id, attributeValueId: attrValId },
            { transaction }
          );
        }
      }

      await transaction.commit();

      await AuditLog.create({
        adminId,
        action: 'PRODUCT_UPDATED',
        entity: 'Product',
        entityId: id,
        metadata: updates,
        ipAddress: ipAddress || null,
      });

      this.syncProductToMeilisearch(id).catch((err) => {
        logger.warn(`Background Meilisearch sync failed for product ${id}: ${err.message}`);
      });

      return await this.getProductById(id);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  /**
   * Quick status toggle (Publish / Unpublish / Draft)
   */
  async updateProductStatus(id, { status, adminId, ipAddress }) {
    if (!Object.values(PRODUCT_STATUS).includes(status)) {
      throw AppError.badRequest('Invalid product status');
    }

    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound('Product not found');

    const updates = {
      status,
      isActive: status === PRODUCT_STATUS.PUBLISHED,
    };
    if (status === PRODUCT_STATUS.PUBLISHED && !product.publishedAt) {
      updates.publishedAt = new Date();
    }

    await product.update(updates);

    await AuditLog.create({
      adminId,
      action: status === PRODUCT_STATUS.PUBLISHED ? 'PRODUCT_PUBLISHED' : 'PRODUCT_UNPUBLISHED',
      entity: 'Product',
      entityId: id,
      metadata: { status },
      ipAddress: ipAddress || null,
    });

    this.syncProductToMeilisearch(id).catch((err) => {
      logger.warn(`Background Meilisearch sync failed for product ${id}: ${err.message}`);
    });

    return product;
  },

  /**
   * Soft delete / Archive product
   */
  async deleteProduct(id, { adminId, ipAddress }) {
    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound('Product not found');

    // Paranoid soft delete (sets deletedAt timestamp)
    await product.destroy();

    await AuditLog.create({
      adminId,
      action: 'PRODUCT_DELETED_ARCHIVED',
      entity: 'Product',
      entityId: id,
      metadata: { name: product.name, sku: product.sku },
      ipAddress: ipAddress || null,
    });

    // Remove from Meilisearch index
    try {
      const client = meiliService.getClient();
      if (client) {
        const index = await meiliService.getProductsIndex();
        await index.deleteDocument(id);
      }
    } catch (err) {
      logger.warn(`Failed to delete product ${id} from Meilisearch: ${err.message}`);
    }

    return { message: 'Product archived and removed from public catalog successfully' };
  },

  /**
   * Bulk soft-delete products or delete all products
   */
  async bulkDeleteProducts({ ids = [], all = false, adminId, ipAddress }) {
    let targetIds = [];
    if (all) {
      const allProducts = await Product.findAll({ attributes: ['id'] });
      targetIds = allProducts.map((p) => p.id);
    } else if (Array.isArray(ids) && ids.length > 0) {
      targetIds = ids;
    } else {
      throw AppError.badRequest('Must provide product IDs or set all: true');
    }

    if (targetIds.length === 0) {
      return { message: 'No products to delete', count: 0 };
    }

    const count = await Product.destroy({
      where: {
        id: { [Op.in]: targetIds },
      },
    });

    // Record audit log asynchronously
    AuditLog.create({
      adminId,
      action: 'PRODUCTS_BULK_DELETED',
      entity: 'Product',
      metadata: { count, targetIdsCount: targetIds.length, all },
      ipAddress: ipAddress || null,
    }).catch(() => {});

    // Batch delete from Meilisearch
    try {
      const client = meiliService.getClient();
      if (client) {
        const index = await meiliService.getProductsIndex();
        await index.deleteDocuments(targetIds);
      }
    } catch (err) {
      logger.warn(`Failed to bulk delete products from Meilisearch: ${err.message}`);
    }

    return { message: `Successfully deleted ${count} product(s)`, count };
  },

  /**
   * Synchronize single product document to Meilisearch
   */
  async syncProductToMeilisearch(productId) {
    try {
      const product = await Product.findByPk(productId, {
        include: [
          {
            model: Subcategory,
            as: 'subcategory',
            include: [{ model: Category, as: 'category' }],
          },
          { model: ProductImage, as: 'images' },
          {
            model: ProductVariant,
            as: 'variants',
            include: [
              { model: Color, as: 'color' },
              { model: Size, as: 'size' },
            ],
          },
        ],
      });

      if (!product || product.deletedAt) {
        return;
      }

      const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

      const doc = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription,
        description: product.description,
        price: parseFloat(product.price),
        salePrice: parseFloat(product.salePrice),
        discountPercent: product.discountPercent,
        stock: product.stock,
        rating: parseFloat(product.rating || 0),
        reviewCount: product.reviewCount || 0,
        status: product.status,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isBestSeller: product.isBestSeller,
        isBulk: product.isBulk,
        minOrderQuantity: product.minOrderQuantity || 1,
        tags: product.tags || [],
        category: product.subcategory?.category?.name || '',
        subcategory: product.subcategory?.name || '',
        imageUrl: primaryImage?.imageUrl || '',
        createdAt: product.createdAt?.toISOString(),
      };

      await meiliService.indexProducts([doc]);
    } catch (err) {
      logger.warn(`Meilisearch sync error: ${err.message}`);
    }
  },
};

export default productService;
