import { Op } from 'sequelize';
import { Coupon } from '../../models/index.js';
import ApiResponse from '../../utils/apiResponse.js';
import AppError from '../../utils/customError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../config/logger.js';

export const couponController = {
  /**
   * 1. List all coupons (Search, Filter, Pagination)
   */
  listCoupons: asyncHandler(async (req, res) => {
    const {
      search = '',
      status = 'all', // 'all' | 'active' | 'inactive' | 'expired'
      type = 'all',   // 'all' | 'PERCENTAGE' | 'FLAT'
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const where = {};

    // Search by code
    if (search.trim()) {
      where.code = {
        [Op.iLike]: `%${search.trim()}%`,
      };
    }

    // Filter by type
    if (type !== 'all') {
      where.discountType = type;
    }

    // Filter by status
    const now = new Date();
    if (status === 'active') {
      where.isActive = true;
      where.endDate = { [Op.gte]: now };
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'expired') {
      where.endDate = { [Op.lt]: now };
    }

    const { count, rows: coupons } = await Coupon.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    const totalPages = Math.ceil(count / parseInt(limit, 10));

    return ApiResponse.success(
      res,
      {
        coupons,
        pagination: {
          total: count,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages,
        },
      },
      'Coupons retrieved successfully'
    );
  }),

  /**
   * 2. Get single coupon details
   */
  getCoupon: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return next(AppError.notFound('Coupon not found'));
    }

    return ApiResponse.success(res, { coupon }, 'Coupon details retrieved');
  }),

  /**
   * 3. Create new coupon
   */
  createCoupon: asyncHandler(async (req, res, next) => {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount = 0,
      maxDiscountAmount = null,
      startDate,
      endDate,
      usageLimit = 1000,
      isActive = true,
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return next(AppError.badRequest('Code, discountType, and discountValue are required'));
    }

    const cleanCode = code.trim().toUpperCase();

    // Check duplicate
    const existing = await Coupon.findOne({ where: { code: cleanCode } });
    if (existing) {
      return next(AppError.badRequest(`Coupon code "${cleanCode}" already exists`));
    }

    // Validate dates
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (end <= start) {
      return next(AppError.badRequest('End date must be after start date'));
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderAmount: parseFloat(minOrderAmount || 0),
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      startDate: start,
      endDate: end,
      usageLimit: parseInt(usageLimit || 1000, 10),
      usedCount: 0,
      isActive: Boolean(isActive),
    });

    logger.info(`Admin ${req.admin?.email} created coupon: ${cleanCode}`);

    return ApiResponse.created(res, { coupon }, `Coupon ${cleanCode} created successfully`);
  }),

  /**
   * 4. Update coupon
   */
  updateCoupon: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return next(AppError.notFound('Coupon not found'));
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode !== coupon.code) {
        const existing = await Coupon.findOne({ where: { code: cleanCode } });
        if (existing) {
          return next(AppError.badRequest(`Coupon code "${cleanCode}" already exists`));
        }
        coupon.code = cleanCode;
      }
    }

    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = parseFloat(discountValue);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = parseFloat(minOrderAmount || 0);
    if (maxDiscountAmount !== undefined) {
      coupon.maxDiscountAmount = maxDiscountAmount ? parseFloat(maxDiscountAmount) : null;
    }
    if (startDate !== undefined) coupon.startDate = new Date(startDate);
    if (endDate !== undefined) coupon.endDate = new Date(endDate);
    if (usageLimit !== undefined) coupon.usageLimit = parseInt(usageLimit, 10);
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();

    logger.info(`Admin ${req.admin?.email} updated coupon: ${coupon.code}`);

    return ApiResponse.success(res, { coupon }, `Coupon ${coupon.code} updated successfully`);
  }),

  /**
   * 5. Toggle coupon status (active/inactive)
   */
  updateCouponStatus: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return next(AppError.notFound('Coupon not found'));
    }

    coupon.isActive = isActive !== undefined ? Boolean(isActive) : !coupon.isActive;
    await coupon.save();

    logger.info(`Admin ${req.admin?.email} toggled coupon ${coupon.code} status to ${coupon.isActive}`);

    return ApiResponse.success(
      res,
      { coupon },
      `Coupon ${coupon.code} is now ${coupon.isActive ? 'Active' : 'Inactive'}`
    );
  }),

  /**
   * 6. Delete coupon
   */
  deleteCoupon: asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return next(AppError.notFound('Coupon not found'));
    }

    const code = coupon.code;
    await coupon.destroy();

    logger.info(`Admin ${req.admin?.email} deleted coupon: ${code}`);

    return ApiResponse.success(res, { id }, `Coupon ${code} deleted successfully`);
  }),
};

export default couponController;
