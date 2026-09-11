import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import userAuthService from '../services/authService.js';

/**
 * POST /api/v1/user/auth/google
 * Customer Google Authentication (Firebase Sign-In)
 */
export const loginWithGoogle = asyncHandler(async (req, res) => {
  const { idToken, email, name, avatar, googleId } = req.body;

  const result = await userAuthService.loginWithGoogle({
    idToken,
    email,
    name,
    avatar,
    googleId,
  });

  return ApiResponse.success(
    res,
    {
      user: result.user,
      token: result.token,
    },
    'Customer signed in successfully with Google'
  );
});

/**
 * GET /api/v1/user/me
 * Get current authenticated customer profile
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await userAuthService.getProfile(req.user.id);
  return ApiResponse.success(res, { user }, 'Customer profile retrieved successfully');
});

/**
 * POST /api/v1/user/auth/logout
 * Customer Logout
 */
export const logout = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, null, 'Customer signed out successfully');
});

export default {
  loginWithGoogle,
  getMe,
  logout,
};
