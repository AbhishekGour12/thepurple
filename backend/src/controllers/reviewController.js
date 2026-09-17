import { Review, Product, User, Order, OrderItem, sequelize } from '../models/index.js';
import ApiResponse from '../utils/apiResponse.js';

const isUuid = (val) => Boolean(val && typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim()));

export const reviewController = {
  /**
   * 1. Get All Approved Reviews & Rating Statistics for a Product (by ID or Slug)
   */
  async getProductReviews(req, res, next) {
    try {
      const { productIdOrSlug } = req.params;
      const { page = 1, limit = 50, rating } = req.query;

      if (!productIdOrSlug) {
        return ApiResponse.error(res, 'Product ID or Slug is required', 400);
      }

      // Resolve product
      const productWhere = isUuid(productIdOrSlug)
        ? { id: productIdOrSlug.trim() }
        : { slug: productIdOrSlug.trim() };

      const product = await Product.findOne({
        where: productWhere,
        attributes: ['id', 'name', 'slug', 'rating', 'reviewCount', 'price', 'salePrice'],
      });

      if (!product) {
        return ApiResponse.error(res, 'Product not found', 404);
      }

      const reviewWhere = {
        productId: product.id,
        status: 'APPROVED',
      };

      if (rating && parseInt(rating, 10) >= 1 && parseInt(rating, 10) <= 5) {
        reviewWhere.rating = parseInt(rating, 10);
      }

      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      // Fetch reviews with user info if available
      const { count, rows: reviews } = await Review.findAndCountAll({
        where: reviewWhere,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit, 10),
        offset,
      });

      // Calculate star distribution across all approved reviews for this product
      const allApproved = await Review.findAll({
        where: { productId: product.id, status: 'APPROVED' },
        attributes: ['rating'],
      });

      const totalReviews = allApproved.length;
      let totalRatingSum = 0;
      const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      allApproved.forEach((r) => {
        const star = Math.min(5, Math.max(1, parseInt(r.rating, 10) || 5));
        starCounts[star] = (starCounts[star] || 0) + 1;
        totalRatingSum += star;
      });

      const averageRating = totalReviews > 0
        ? parseFloat((totalRatingSum / totalReviews).toFixed(1))
        : parseFloat(product.rating || 4.8);

      const starPercentages = {
        5: totalReviews > 0 ? Math.round((starCounts[5] / totalReviews) * 100) : 80,
        4: totalReviews > 0 ? Math.round((starCounts[4] / totalReviews) * 100) : 15,
        3: totalReviews > 0 ? Math.round((starCounts[3] / totalReviews) * 100) : 3,
        2: totalReviews > 0 ? Math.round((starCounts[2] / totalReviews) * 100) : 1,
        1: totalReviews > 0 ? Math.round((starCounts[1] / totalReviews) * 100) : 1,
      };

      return ApiResponse.success(
        res,
        {
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            rating: averageRating,
            reviewCount: totalReviews || product.reviewCount || 0,
          },
          reviews,
          stats: {
            averageRating,
            totalReviews,
            starCounts,
            starPercentages,
          },
          pagination: {
            total: count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(count / parseInt(limit, 10)),
          },
        },
        'Product reviews retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 2. Submit a New Product Review & Rating
   */
  async createReview(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const {
        productId,
        slug,
        rating,
        comment,
      } = req.body;

      if (!req.user) {
        await transaction.rollback();
        return ApiResponse.error(res, 'Please sign in to submit a review', 401);
      }

      if (!rating || parseInt(rating, 10) < 1 || parseInt(rating, 10) > 5) {
        await transaction.rollback();
        return ApiResponse.error(res, 'Rating must be between 1 and 5 stars', 400);
      }

      if (!comment || String(comment).trim().length < 3) {
        await transaction.rollback();
        return ApiResponse.error(res, 'Please write a review comment of at least 3 characters', 400);
      }

      // Resolve product
      let product = null;
      if (productId && isUuid(productId)) {
        product = await Product.findByPk(productId, { transaction });
      }
      if (!product && (slug || productId)) {
        const searchKey = slug || productId;
        product = await Product.findOne({
          where: isUuid(searchKey) ? { id: searchKey } : { slug: searchKey },
          transaction,
        });
      }

      if (!product) {
        await transaction.rollback();
        return ApiResponse.error(res, 'Target product not found', 404);
      }

      // Authenticated customer details
      const user = req.user;
      const userId = user.id;
      const finalUserName = (user.name || (user.email ? user.email.split('@')[0] : null) || 'User').trim();
      const finalUserEmail = user.email || null;

      // Check if user has purchased this product (Verified Purchase badge)
      let isVerifiedPurchase = true;
      if (userId) {
        const orderItem = await OrderItem.findOne({
          include: [
            {
              model: Order,
              as: 'order',
              where: {
                userId,
                status: { [sequelize.Sequelize.Op.ne]: 'CANCELLED' },
              },
            },
          ],
          where: { productId: product.id },
          transaction,
        });
        isVerifiedPurchase = Boolean(orderItem);
      }

      // Create review record (taking only rating and comment from user)
      const newReview = await Review.create(
        {
          productId: product.id,
          userId,
          userName: finalUserName,
          userEmail: finalUserEmail,
          rating: parseInt(rating, 10),
          title: null,
          comment: comment.trim(),
          isVerifiedPurchase,
          status: 'APPROVED',
          helpfulCount: 0,
        },
        { transaction }
      );

      // Recalculate and update Product rating & reviewCount
      const allApproved = await Review.findAll({
        where: { productId: product.id, status: 'APPROVED' },
        attributes: ['rating'],
        transaction,
      });

      const totalReviews = allApproved.length;
      let totalRatingSum = 0;
      allApproved.forEach((r) => {
        totalRatingSum += parseInt(r.rating, 10) || 5;
      });

      const updatedAvgRating = parseFloat((totalRatingSum / totalReviews).toFixed(1));

      await product.update(
        {
          rating: updatedAvgRating,
          reviewCount: totalReviews,
        },
        { transaction }
      );

      await transaction.commit();

      return ApiResponse.success(
        res,
        {
          review: newReview,
          product: {
            id: product.id,
            rating: updatedAvgRating,
            reviewCount: totalReviews,
          },
        },
        'Thank you! Your review and rating have been published 🎉',
        201
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  },

  /**
   * 3. Mark Review as Helpful (Thumbs Up)
   */
  async markHelpful(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || !isUuid(id)) {
        return ApiResponse.error(res, 'Valid review ID is required', 400);
      }

      const review = await Review.findByPk(id);
      if (!review) {
        return ApiResponse.error(res, 'Review not found', 404);
      }

      await review.increment('helpfulCount', { by: 1 });
      await review.reload();

      return ApiResponse.success(
        res,
        {
          id: review.id,
          helpfulCount: review.helpfulCount,
        },
        'Marked as helpful'
      );
    } catch (error) {
      next(error);
    }
  },
};

export default reviewController;
