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
      collection,
      newArrivals,
      bestSellers,
      offers,
      gifts,
      isFeatured,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    where.status = { [Op.ne]: PRODUCT_STATUS.UNPUBLISHED };

    // 1. Collection Filter (New Arrivals, Best Sellers, Offers, Gifts, Featured)
    if (collection === 'new-arrivals' || newArrivals === 'true') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      where[Op.or] = [
        { badge: { [Op.iLike]: '%new%' } },
        { publishedAt: { [Op.gte]: thirtyDaysAgo } },
        { createdAt: { [Op.gte]: thirtyDaysAgo } },
      ];
    } else if (collection === 'best-sellers' || bestSellers === 'true') {
      where[Op.or] = [
        { isBestSeller: true },
        { badge: { [Op.iLike]: '%best%' } },
      ];
    } else if (collection === 'offers' || collection === 'special-offers' || offers === 'true') {
      where[Op.or] = [
        { discountPercent: { [Op.gt]: 0 } },
        { badge: { [Op.iLike]: '%deal%' } },
        { badge: { [Op.iLike]: '%offer%' } },
        { badge: { [Op.iLike]: '%sale%' } },
      ];
    } else if (collection === 'gifts' || collection === 'gift-cards' || gifts === 'true') {
      where[Op.or] = [
        { name: { [Op.iLike]: '%gift%' } },
        { name: { [Op.iLike]: '%teddy%' } },
        { name: { [Op.iLike]: '%hamper%' } },
        { name: { [Op.iLike]: '%box%' } },
        { name: { [Op.iLike]: '%set%' } },
        { shortDescription: { [Op.iLike]: '%gift%' } },
        { description: { [Op.iLike]: '%gift%' } },
        { badge: { [Op.iLike]: '%gift%' } },
      ];
    }

    if (isFeatured === 'true' || collection === 'featured') {
      where.isFeatured = true;
    }

    // 2. Intelligent, Typo-Tolerant & Category-Aware Search query
    if (search && search.trim()) {
      const rawSearch = search.trim().toLowerCase().replace(/[^\w\s]/gi, ' ');
      const tokens = rawSearch.split(/\s+/).filter(Boolean);

      const synonymMap = {
        gift: ['gift', 'hamper', 'teddy', 'box', 'set', 'celebration', 'pendant', 'present'],
        gifts: ['gift', 'hamper', 'teddy', 'box', 'set', 'celebration', 'pendant', 'present'],
        gifting: ['gift', 'hamper', 'teddy', 'box', 'set'],
        hamper: ['hamper', 'gift', 'celebration', 'teddy', 'box', 'set'],
        hampers: ['hamper', 'gift', 'celebration', 'teddy', 'box', 'set'],
        teddy: ['teddy', 'bear', 'plush', 'gift', 'hamper'],
        teddies: ['teddy', 'bear', 'plush', 'gift'],
        chain: ['chain', 'choker', 'rope', 'cuban', 'italian', 'layered', 'necklace', 'collar'],
        chains: ['chain', 'choker', 'rope', 'cuban', 'italian', 'layered', 'necklace', 'collar'],
        choker: ['choker', 'necklace', 'collar', 'chain'],
        necklace: ['necklace', 'choker', 'haram', 'pendant', 'collar', 'chain', 'mangalsutra'],
        necklaces: ['necklace', 'choker', 'haram', 'pendant', 'collar', 'chain', 'mangalsutra'],
        neckla: ['necklace', 'choker', 'chain'],
        pendant: ['pendant', 'necklace', 'solitaire', 'heart'],
        earring: ['earring', 'jhumka', 'chandbali', 'stud', 'drop', 'polki'],
        earrings: ['earring', 'jhumka', 'chandbali', 'stud', 'drop', 'polki'],
        earing: ['earring', 'earrings', 'jhumka', 'chandbali', 'stud'],
        earings: ['earring', 'earrings', 'jhumka', 'chandbali', 'stud'],
        erring: ['earring', 'earrings', 'jhumka', 'chandbali', 'stud'],
        errings: ['earring', 'earrings', 'jhumka', 'chandbali', 'stud'],
        jhumka: ['jhumka', 'earring', 'chandbali'],
        jhumkas: ['jhumka', 'earring', 'chandbali'],
        stud: ['stud', 'earring', 'diamond'],
        studs: ['stud', 'earring', 'diamond'],
        bangle: ['bangle', 'kada', 'bracelet', 'peacock'],
        bangles: ['bangle', 'kada', 'bracelet', 'peacock'],
        bangal: ['bangle', 'bangles', 'kada', 'bracelet'],
        bangals: ['bangle', 'bangles', 'kada', 'bracelet'],
        kada: ['kada', 'bangle', 'bracelet'],
        kadas: ['kada', 'bangle', 'bracelet'],
        bracelet: ['bracelet', 'bangle', 'kada'],
        bracelets: ['bracelet', 'bangle', 'kada'],
        ring: ['ring', 'solitaire', 'diamond', 'band'],
        rings: ['ring', 'solitaire', 'diamond', 'band'],
        gold: ['gold', '22k', '18k', 'yellow'],
        silver: ['silver', '925', 'sterling'],
        diamond: ['diamond', 'solitaire', 'cluster', 'cz'],
        kurta: ['kurta', 'silk', 'apparel', 'dress'],
        kurtas: ['kurta', 'silk', 'apparel', 'dress'],
      };

      const termsSet = new Set();
      if (rawSearch.length >= 2) termsSet.add(rawSearch);

      tokens.forEach((token) => {
        if (token.length >= 2) termsSet.add(token);

        // Deduplicate consecutive repeated letters (e.g. giftt -> gift, chainn -> chain)
        const dedup = token.replace(/(.)\1+/g, '$1');
        if (dedup.length >= 2) termsSet.add(dedup);

        // Prefix stems for longer words
        if (token.length >= 5) termsSet.add(token.slice(0, -1));
        if (dedup.length >= 5) termsSet.add(dedup.slice(0, -1));

        // Stems for plural / forms
        const stem = token.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '');
        if (stem.length >= 2) termsSet.add(stem);

        const candidateKeys = [token, dedup, stem];
        candidateKeys.forEach((k) => {
          if (synonymMap[k]) {
            synonymMap[k].forEach((s) => termsSet.add(s));
          }
        });
      });

      const termList = Array.from(termsSet).filter((t) => t.length >= 2);

      // Find matching categories and subcategories
      const catSubOr = [];
      termList.forEach((term) => {
        catSubOr.push({ name: { [Op.iLike]: `%${term}%` } });
        catSubOr.push({ slug: { [Op.iLike]: `%${term}%` } });
      });

      const [matchingSubs, matchingCats] = await Promise.all([
        Subcategory.findAll({
          where: { [Op.or]: catSubOr },
          attributes: ['id'],
        }),
        Category.findAll({
          where: { [Op.or]: catSubOr },
          include: [{ model: Subcategory, as: 'subcategories', attributes: ['id'] }],
        }),
      ]);

      const subIds = new Set(matchingSubs.map((s) => s.id));
      matchingCats.forEach((c) => {
        (c.subcategories || []).forEach((sc) => subIds.add(sc.id));
      });

      const searchConditions = [];
      termList.forEach((term) => {
        const q = `%${term}%`;
        searchConditions.push({ name: { [Op.iLike]: q } });
        searchConditions.push({ sku: { [Op.iLike]: q } });
        searchConditions.push({ brand: { [Op.iLike]: q } });
        searchConditions.push({ shortDescription: { [Op.iLike]: q } });
        searchConditions.push({ description: { [Op.iLike]: q } });
        searchConditions.push({ badge: { [Op.iLike]: q } });
        searchConditions.push({ seoKeywords: { [Op.iLike]: q } });
        searchConditions.push({ seoTitle: { [Op.iLike]: q } });
      });

      if (subIds.size > 0) {
        searchConditions.push({ subcategoryId: { [Op.in]: Array.from(subIds) } });
      }

      if (where[Op.or]) {
        where[Op.and] = [{ [Op.or]: where[Op.or] }, { [Op.or]: searchConditions }];
        delete where[Op.or];
      } else {
        where[Op.or] = searchConditions;
      }
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
        return [param.trim()].filter(Boolean);
      }
      return [String(param).trim()].filter(Boolean);
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
      if (subIds.length === 0) {
        // No matching subcategories/categories found -> return empty products list immediately
        return ApiResponse.success(
          res,
          {
            products: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: 0,
              totalPages: 0,
            },
          },
          'Products retrieved successfully'
        );
      }
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
    } else if (collection === 'new-arrivals' || newArrivals === 'true') {
      order = [['createdAt', 'DESC']];
    } else if (collection === 'best-sellers' || bestSellers === 'true') {
      order = [['isBestSeller', 'DESC'], ['rating', 'DESC'], ['createdAt', 'DESC']];
    } else if (collection === 'offers' || offers === 'true') {
      order = [['discountPercent', 'DESC'], ['createdAt', 'DESC']];
    } else {
      order = [['isFeatured', 'DESC'], ['createdAt', 'DESC']];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'displayOrder', 'colorId'],
          include: [{ model: Color, as: 'color', attributes: ['id', 'name', 'hexCode'] }],
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
 * @route   GET /api/v1/products/new-arrivals
 * @desc    Get new arrival products filtered by publishedAt, createdAt, and badge
 * @access  Public
 */
router.get(
  '/new-arrivals',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 30 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));
    const offset = (pageNum - 1) * limitNum;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const where = {
      status: { [Op.ne]: PRODUCT_STATUS.UNPUBLISHED },
      [Op.or]: [
        { badge: { [Op.iLike]: '%new%' } },
        { publishedAt: { [Op.gte]: thirtyDaysAgo } },
        { createdAt: { [Op.gte]: thirtyDaysAgo } },
      ],
    };

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'displayOrder', 'colorId'],
          include: [{ model: Color, as: 'color', attributes: ['id', 'name', 'hexCode'] }],
          required: false,
        },
        {
          model: Subcategory,
          as: 'subcategory',
          required: false,
          include: [{ model: Category, as: 'category', required: false }],
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
      order: [['createdAt', 'DESC']],
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
      'New arrival products retrieved successfully'
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
          attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'displayOrder', 'colorId'],
          include: [{ model: Color, as: 'color', attributes: ['id', 'name', 'hexCode'] }],
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
