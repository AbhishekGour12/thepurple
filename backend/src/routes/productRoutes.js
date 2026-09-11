import { Router } from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
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
} from '../models/index.js';
import { PRODUCT_STATUS } from '../models/Product.js';

const router = Router();

/**
 * @route   GET /api/v1/products
 * @desc    Get storefront products with full dynamic filtering, search, sorting & pagination
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 30,
      search,
      category,
      categories,
      subcategory,
      subcategories,
      colors,
      sizes,
      minPrice,
      maxPrice,
      minDiscount,
      rating,
      inStock,
      sortBy = 'recommended',
      badge,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    where.status = { [Op.ne]: PRODUCT_STATUS.UNPUBLISHED };

    // Search query
    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: q } },
        { sku: { [Op.iLike]: q } },
        { brand: { [Op.iLike]: q } },
        { shortDescription: { [Op.iLike]: q } },
        { description: { [Op.iLike]: q } },
        { badge: { [Op.iLike]: q } },
      ];
    }

    // Badge filter
    if (badge && badge.trim()) {
      where.badge = { [Op.iLike]: `%${badge.trim()}%` };
    }

    // Helper to safely parse multi-value query parameters (handles arrays, comma-delimited, and ||-delimited)
    const parseMultiParam = (param) => {
      if (!param) return [];
      if (Array.isArray(param)) {
        return param.flatMap((p) => parseMultiParam(p));
      }
      if (typeof param === 'string') {
        if (param.includes('||')) {
          return param.split('||').map((p) => p.trim()).filter(Boolean);
        }
        return param.split(',').map((p) => p.trim()).filter(Boolean);
      }
      return [String(param).trim()];
    };

    const catList = [...new Set([...parseMultiParam(categories), ...parseMultiParam(category)])];
    const subList = [...new Set([...parseMultiParam(subcategories), ...parseMultiParam(subcategory)])];

    if (catList.length > 0 || subList.length > 0) {
      const hasSubFilter = subList.length > 0;
      const hasCatFilter = catList.length > 0;

      const subcategoryWhere = {};
      const categoryWhere = {};

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (hasSubFilter) {
        subcategoryWhere[Op.or] = subList.map((subVal) => {
          const isUUID = uuidRegex.test(subVal);
          if (isUUID) return { [Op.or]: [{ id: subVal }, { slug: subVal }] };
          return {
            [Op.or]: [
              { slug: subVal.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
              { slug: { [Op.iLike]: `%${subVal}%` } },
              { name: { [Op.iLike]: `%${subVal}%` } },
            ],
          };
        });
      }

      if (hasCatFilter) {
        categoryWhere[Op.or] = catList.map((catVal) => {
          const isUUID = uuidRegex.test(catVal);
          if (isUUID) return { [Op.or]: [{ id: catVal }, { slug: catVal }] };
          return {
            [Op.or]: [
              { slug: catVal.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
              { slug: { [Op.iLike]: `%${catVal}%` } },
              { name: { [Op.iLike]: `%${catVal}%` } },
            ],
          };
        });
      }

      const matchingSubs = await Subcategory.findAll({
        where: hasSubFilter ? subcategoryWhere : undefined,
        include: [
          {
            model: Category,
            as: 'category',
            where: hasCatFilter ? categoryWhere : undefined,
            required: hasCatFilter,
          },
        ],
        attributes: ['id'],
      });

      const subIds = matchingSubs.map((s) => s.id);
      where.subcategoryId = { [Op.in]: subIds };
    }

    // Price range
    if (minPrice || maxPrice) {
      const priceCondition = {};
      if (minPrice && !isNaN(parseFloat(minPrice))) {
        priceCondition[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        priceCondition[Op.lte] = parseFloat(maxPrice);
      }
      if (Reflect.ownKeys(priceCondition).length > 0) {
        where.price = priceCondition;
      }
    }

    // Discount filter
    if (minDiscount && !isNaN(parseInt(minDiscount, 10))) {
      where.discountPercent = { [Op.gte]: parseInt(minDiscount, 10) };
    }

    // Rating filter
    if (rating && !isNaN(parseFloat(rating))) {
      where.rating = { [Op.gte]: parseFloat(rating) };
    }

    // Stock availability
    if (inStock === 'true' || inStock === true) {
      where.stock = { [Op.gt]: 0 };
    }

    // Colors / Sizes filter via ProductVariant
    const colorList = parseMultiParam(colors);
    const sizeList = parseMultiParam(sizes);

    const hasColorFilter = colorList.length > 0;
    const hasSizeFilter = sizeList.length > 0;

    if (hasColorFilter || hasSizeFilter) {
      const colorWhere = {};
      if (hasColorFilter) {
        colorWhere[Op.or] = colorList.map((c) => ({
          name: { [Op.iLike]: `%${c}%` },
        }));
      }

      const sizeWhere = {};
      if (hasSizeFilter) {
        sizeWhere[Op.or] = sizeList.map((s) => ({
          [Op.or]: [{ name: { [Op.iLike]: `%${s}%` } }, { code: { [Op.iLike]: `%${s}%` } }],
        }));
      }

      const matchingVariants = await ProductVariant.findAll({
        include: [
          hasColorFilter ? { model: Color, as: 'color', where: colorWhere, required: true } : null,
          hasSizeFilter ? { model: Size, as: 'size', where: sizeWhere, required: true } : null,
        ].filter(Boolean),
        attributes: ['productId'],
      });
      const prodIds = [...new Set(matchingVariants.map((v) => v.productId))];
      where.id = { [Op.in]: prodIds };
    }

    // Order sorting
    let order = [['createdAt', 'DESC']];
    if (sortBy === 'price-low') {
      order = [['price', 'ASC']];
    } else if (sortBy === 'price-high') {
      order = [['price', 'DESC']];
    } else if (sortBy === 'discount') {
      order = [['discountPercent', 'DESC']];
    } else if (sortBy === 'rating') {
      order = [['rating', 'DESC'], ['reviewCount', 'DESC']];
    } else if (sortBy === 'bestseller' || sortBy === 'popular') {
      order = [['isBestSeller', 'DESC'], ['rating', 'DESC']];
    } else if (sortBy === 'newest') {
      order = [['createdAt', 'DESC']];
    } else {
      order = [['isFeatured', 'DESC'], ['createdAt', 'DESC']];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'displayOrder'],
          required: false,
        },
        {
          model: Subcategory,
          as: 'subcategory',
          required: false,
          include: [
            {
              model: Category,
              as: 'category',
              required: false,
            },
          ],
        },
        {
          model: ProductVariant,
          as: 'variants',
          required: false,
          include: [
            { model: Color, as: 'color', attributes: ['id', 'name', 'hexCode'] },
            { model: Size, as: 'size', attributes: ['id', 'name', 'code'] },
          ],
        },
      ],
      order,
      limit: limitNum,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limitNum);

    return ApiResponse.success(
      res,
      {
        products,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasMore: pageNum < totalPages,
        },
      },
      'Storefront products retrieved successfully'
    );
  })
);

/**
 * @route   GET /api/v1/products/filters
 * @desc    Get dynamic catalog filter aggregations (categories, colors, sizes, price bounds)
 * @access  Public
 */
router.get(
  '/filters',
  asyncHandler(async (req, res) => {
    const [categories, colors, sizes] = await Promise.all([
      Category.findAll({
        where: { isActive: true },
        include: [
          {
            model: Subcategory,
            as: 'subcategories',
            where: { isActive: true },
            required: false,
            attributes: ['id', 'name', 'slug'],
          },
        ],
        order: [['displayOrder', 'ASC'], ['name', 'ASC']],
      }),
      Color.findAll({
        where: { isActive: true },
        order: [['displayOrder', 'ASC'], ['name', 'ASC']],
        attributes: ['id', 'name', 'hexCode'],
      }),
      Size.findAll({
        where: { isActive: true },
        order: [['displayOrder', 'ASC'], ['name', 'ASC']],
        attributes: ['id', 'name', 'code'],
      }),
    ]);

    return ApiResponse.success(
      res,
      {
        categories,
        colors,
        sizes,
      },
      'Filter taxonomy retrieved successfully'
    );
  })
);

/**
 * @route   GET /api/v1/products/:slugOrId
 * @desc    Get single product details
 * @access  Public
 */
router.get(
  '/:slugOrId',
  asyncHandler(async (req, res) => {
    const { slugOrId } = req.params;

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    const product = await Product.findOne({
      where: isUUID ? { id: slugOrId } : { slug: slugOrId },
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'displayOrder'],
        },
        {
          model: Subcategory,
          as: 'subcategory',
          include: [{ model: Category, as: 'category' }],
        },
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

    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }

    return ApiResponse.success(res, { product }, 'Product details retrieved successfully');
  })
);

export default router;
