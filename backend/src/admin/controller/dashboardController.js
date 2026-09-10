import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import dashboardService from '../services/dashboardService.js';

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const { timeRange } = req.query;
  const data = await dashboardService.getDashboardAnalytics(timeRange);
  return ApiResponse.success(res, data, 'Admin dashboard analytics retrieved successfully');
});

export default {
  getDashboardAnalytics,
};
