import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * GET /api/v1/admin/dashboard
 * Placeholder — returns basic admin dashboard data.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, {
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    revenue: 0,
  }, 'Admin dashboard data fetched successfully');
});
