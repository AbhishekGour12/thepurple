import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { User } from '../../models/index.js';

/**
 * PATCH /api/v1/user/me
 * Update authenticated user's profile and default address.
 */
export const updateMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    name,
    mobile,
    contactEmail,
    alternatePhone,
    shippingAddress,
    landmark,
    city,
    state,
    pincode,
    avatar,
  } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name ? String(name).trim() : null;
  if (mobile !== undefined) updates.mobile = mobile ? String(mobile).replace(/[^\d+]/g, '').trim() : null;
  if (contactEmail !== undefined) updates.contactEmail = contactEmail ? String(contactEmail).toLowerCase().trim() : null;
  if (alternatePhone !== undefined) updates.alternatePhone = alternatePhone ? String(alternatePhone).replace(/[^\d+]/g, '').trim() : null;
  if (shippingAddress !== undefined) updates.shippingAddress = shippingAddress ? String(shippingAddress).trim() : null;
  if (landmark !== undefined) updates.landmark = landmark ? String(landmark).trim() : null;
  if (city !== undefined) updates.city = city ? String(city).trim() : null;
  if (state !== undefined) updates.state = state ? String(state).trim() : null;
  if (pincode !== undefined) updates.pincode = pincode ? String(pincode).trim() : null;
  if (avatar !== undefined) updates.avatar = avatar;

  await user.update(updates);

  return ApiResponse.success(res, { user }, 'Customer profile updated successfully');
});

/**
 * DELETE /api/v1/user/me
 * Delete authenticated user's account.
 */
export const deleteMe = asyncHandler(async (req, res) => {
  const user = req.user;
  await user.update({ status: 'INACTIVE' });
  return ApiResponse.success(res, null, 'Customer account deactivated successfully');
});
