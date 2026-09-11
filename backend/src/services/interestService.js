import { Op } from 'sequelize';
import {
  ProductInterest,
  Product,
  ProductImage,
  Subcategory,
  Category,
  User,
} from '../models/index.js';
import AppError from '../utils/customError.js';
import logger from '../config/logger.js';

export const toggleInterest = async ({
  productId,
  userId = null,
  guestId = null,
}) => {
  if (!productId) {
    throw AppError.badRequest('Product ID is required');
  }

  // Verify product exists
  const product = await Product.findByPk(productId);
  if (!product) {
    throw AppError.notFound('Product not found');
  }

  const where = { productId };
  if (userId) {
    where.userId = userId;
  } else if (guestId) {
    where.guestId = guestId;
  } else {
    throw AppError.badRequest('User ID or Guest ID is required');
  }

  const existing = await ProductInterest.findOne({ where });

  let isInterested = false;
  if (existing) {
    await existing.destroy();
    isInterested = false;
  } else {
    await ProductInterest.create({
      productId,
      userId: userId || null,
      guestId: !userId ? guestId : null,
    });
    isInterested = true;
  }

  // Compute live like count for the product
  const likeCount = await ProductInterest.count({ where: { productId } });

  return {
    isInterested,
    likeCount,
    productId,
    message: isInterested ? 'Saved to Wishlist & Interests' : 'Removed from Wishlist & Interests',
  };
};

export const getMyInterests = async ({ userId = null, guestId = null }) => {
  const where = {};
  if (userId) {
    where.userId = userId;
  } else if (guestId) {
    where.guestId = guestId;
  } else {
    return { interests: [] };
  }

  const interests = await ProductInterest.findAll({
    where,
    include: [
      {
        model: Product,
        as: 'product',
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
            include: [
              {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug'],
              },
            ],
          },
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return { interests };
};

export const checkInterest = async ({ productId, userId = null, guestId = null }) => {
  if (!productId) return { isInterested: false, likeCount: 0 };

  const where = { productId };
  if (userId) {
    where.userId = userId;
  } else if (guestId) {
    where.guestId = guestId;
  }

  const existing = (userId || guestId) ? await ProductInterest.findOne({ where }) : null;
  const likeCount = await ProductInterest.count({ where: { productId } });

  return {
    isInterested: Boolean(existing),
    likeCount,
  };
};

export const removeInterest = async ({ id, userId = null, guestId = null }) => {
  const interest = await ProductInterest.findByPk(id);
  if (!interest) {
    throw AppError.notFound('Interest record not found');
  }

  if (userId && interest.userId && interest.userId !== userId) {
    throw AppError.forbidden('Unauthorized');
  }

  await interest.destroy();
  return { message: 'Removed successfully' };
};

export const listAdminInterests = async ({
  page = 1,
  limit = 20,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const { rows: interests, count: total } = await ProductInterest.findAndCountAll({
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'sku', 'price', 'salePrice', 'slug'],
        include: [
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'imageUrl', 'isPrimary'],
            required: false,
          },
        ],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone'],
        required: false,
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: limitNum,
    offset,
  });

  return {
    interests,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

export default {
  toggleInterest,
  getMyInterests,
  checkInterest,
  removeInterest,
  listAdminInterests,
};
