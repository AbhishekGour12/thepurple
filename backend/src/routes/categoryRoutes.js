import { Router } from 'express';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { Category, Subcategory } from '../models/index.js';

const router = Router();

/**
 * @route   GET /api/v1/categories
 * @desc    Get active categories and their active subcategories for storefront navigation & modal
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { isFeatured } = req.query;

    const where = {
      isActive: true,
    };

    if (isFeatured !== undefined && isFeatured !== '') {
      where.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    const categories = await Category.findAll({
      where,
      include: [
        {
          model: Subcategory,
          as: 'subcategories',
          where: { isActive: true },
          required: false,
          attributes: ['id', 'name', 'slug', 'description', 'imageUrl', 'displayOrder'],
        },
      ],
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC'],
        [{ model: Subcategory, as: 'subcategories' }, 'displayOrder', 'ASC'],
        [{ model: Subcategory, as: 'subcategories' }, 'name', 'ASC'],
      ],
    });

    return ApiResponse.success(res, { categories }, 'Storefront categories retrieved successfully');
  })
);

export default router;
