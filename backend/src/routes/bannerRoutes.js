import { Router } from 'express';
import { Banner } from '../models/index.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// GET /api/v1/banners - Public Storefront Banners
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { placement } = req.query;
    const where = { isActive: true };

    if (placement) {
      where.placement = placement;
    }

    const banners = await Banner.findAll({
      where,
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    // Group by placement for convenience
    const homeHero = banners.filter((b) => b.placement === 'HOME_HERO');
    const productsHero = banners.filter((b) => b.placement === 'PRODUCTS_HERO');
    const homeOffer = banners.filter((b) => b.placement === 'HOME_OFFER');
    const activeOffer = homeOffer[0] || null;

    return ApiResponse.success(
      res,
      {
        banners,
        homeHero,
        productsHero,
        homeOffer,
        activeOffer,
      },
      'Banners retrieved successfully'
    );
  })
);

export default router;
