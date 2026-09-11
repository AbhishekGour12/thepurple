import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * PATCH /api/v1/user/me
 * Update authenticated user's profile.
 */
export const updateMe = asyncHandler(async (req, res) => {
  // TODO: Implement profile update logic
  return ApiResponse.success(res, null, 'Update profile endpoint — not yet implemented', 501);
});

/**
 * DELETE /api/v1/user/me
 * Delete authenticated user's account.
 */
export const deleteMe = asyncHandler(async (req, res) => {
  // TODO: Implement account deletion logic
  return ApiResponse.success(res, null, 'Delete account endpoint — not yet implemented', 501);
});
