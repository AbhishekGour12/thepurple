import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import userService from '../services/userService.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { search, role, status, authProvider, page, limit } = req.query;
  const data = await userService.listUsers({ search, role, status, authProvider, page, limit });
  return ApiResponse.success(res, data, 'Users list retrieved successfully');
});

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  return ApiResponse.success(res, { user }, 'User details retrieved successfully');
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = await userService.updateUserStatus(id, status);
  return ApiResponse.success(res, { user }, `User status updated to ${status}`);
});

export default {
  listUsers,
  getUser,
  updateUserStatus,
};
