import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import interestService from '../services/interestService.js';

export const toggleInterest = asyncHandler(async (req, res) => {
  const { productId, guestId } = req.body;
  const userId = req.user?.id || null;

  const result = await interestService.toggleInterest({
    productId,
    userId,
    guestId: guestId || req.headers['x-guest-id'] || null,
  });

  return ApiResponse.success(res, result, result.message);
});

export const getMyInterests = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const guestId = req.query.guestId || req.headers['x-guest-id'] || null;

  const result = await interestService.getMyInterests({
    userId,
    guestId,
  });

  return ApiResponse.success(res, result, 'Interests retrieved successfully');
});

export const checkInterest = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user?.id || null;
  const guestId = req.query.guestId || req.headers['x-guest-id'] || null;

  const result = await interestService.checkInterest({
    productId,
    userId,
    guestId,
  });

  return ApiResponse.success(res, result, 'Interest check completed');
});

export const removeInterest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || null;
  const guestId = req.query.guestId || req.headers['x-guest-id'] || null;

  const result = await interestService.removeInterest({
    id,
    userId,
    guestId,
  });

  return ApiResponse.success(res, result, 'Interest removed successfully');
});

export const listAdminInterests = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await interestService.listAdminInterests({
    page,
    limit,
  });

  return ApiResponse.success(res, result, 'Interests retrieved successfully');
});

export default {
  toggleInterest,
  getMyInterests,
  checkInterest,
  removeInterest,
  listAdminInterests,
};
