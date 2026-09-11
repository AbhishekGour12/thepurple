import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import authService from '../services/authService.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const data = await authService.login({
    email,
    password,
    ipAddress,
    userAgent,
  });

  return ApiResponse.success(res, data, 'Login successful');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await authService.forgotPassword({ email, ipAddress });
  return ApiResponse.success(res, result, result.message);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await authService.resetPassword({
    token,
    newPassword,
    confirmPassword,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await authService.changePassword({
    adminId: req.admin.id,
    currentPassword,
    newPassword,
    confirmPassword,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const logout = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await authService.logout({
    adminToken: req.adminToken,
    adminId: req.admin?.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const admin = await authService.getProfile(req.admin.id);
  return ApiResponse.success(res, { admin }, 'Admin profile retrieved');
});

export default {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  getMe,
};
