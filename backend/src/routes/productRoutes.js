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
      subcategory,
      colors,
      sizes,
      minPrice,
      maxPrice,
      minDiscount,
      rating,
      inStock,
      sortBy = 'recommended',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    const subcategoryWhere = {};
    const categoryWhere = {};
    const variantWhere = {};

    // Only fetch published products (or if none published in seed, include active)
    where.status = { [Op.ne]: PRODUCT_STATUS.UNPUBLISHED };

    // Search query
    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: q } },
        { sku: { [Op.iLike]: q } },
        { brand: { [Op.iLike]: q } },
        { shortDescription: { [Op.iLike]: q } },
      ];
    }

    // Category filter (slug or id)
    if (category) {
      if (category.includes('-') && category.length > 20 && !category.includes(' ')) {
        // Assume UUID or slug
        categoryWhere[Op.or] = [{ id: category }, { slug: category }];
      } else {
        categoryWhere[Op.or] = [
          { slug: category.toLowerCase().trim() },
          { name: { [Op.iLike]: `%${category.trim()}%` } },
        ];
      }
    }

    // Subcategory filter (slug or id)
    if (subcategory) {
      subcategoryWhere[Op.or] = [
        { slug: subcategory.toLowerCase().trim() },
        { name: { [Op.iLike]: `%${subcategory.trim()}%` } },
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Discount filter
    if (minDiscount) {
      where.discountPercent = { [Op.gte]: parseInt(minDiscount, 10) };
    }

    // Stock availability
    if (inStock === 'true' || inStock === true) {
      where.stock = { [Op.gt]: 0 };
    }

    // Order sorting
    let order = [['displayOrder', 'ASC'], ['createdAt', 'DESC']];
    if (sortBy === 'price-low') {
      order = [['price', 'ASC']];
    } else if (sortBy === 'price-high') {
      order = [['price', 'DESC']];
    } else if (sortBy === 'discount') {
      order = [['discountPercent', 'DESC']];
    } else if (sortBy === 'newest') {
      order = [['createdAt', 'DESC']];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'url', 'altText', 'isPrimary', 'displayOrder'],
          required: false,
        },
        {
          model: Subcategory,
          as: 'subcategory',
          where: Object.keys(subcategoryWhere).length > 0 ? subcategoryWhere : undefined,
          required: Object.keys(subcategoryWhere).length > 0 || Object.keys(categoryWhere).length > 0,
          include: [
            {
              model: Category,
              as: 'category',
              where: Object.keys(categoryWhere).length > 0 ? categoryWhere : undefined,
              required: Object.keys(categoryWhere).length > 0,
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
          attributes: ['id', 'url', 'altText', 'isPrimary', 'displayOrder'],
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
