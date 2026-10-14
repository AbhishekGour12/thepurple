import settingService from '../../services/settingService.js';
import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const settingController = {
  /**
   * Get Minimum Cart Value configuration
   * GET /api/v1/admin/settings/min-cart
   */
  getMinCartSetting: asyncHandler(async (req, res) => {
    const config = await settingService.getMinCartSetting();
    return ApiResponse.success(res, config, 'Minimum cart value configuration retrieved');
  }),

  /**
   * Update Minimum Cart Value configuration
   * PUT /api/v1/admin/settings/min-cart
   */
  updateMinCartSetting: asyncHandler(async (req, res) => {
    const { enabled, minCartValue, presets, message } = req.body;
    const updated = await settingService.updateMinCartSetting({
      enabled,
      minCartValue,
      presets,
      message,
    });
    return ApiResponse.success(res, updated, 'Minimum cart value configuration updated successfully');
  }),

  /**
   * Reset / Disable Minimum Cart Value configuration
   * DELETE /api/v1/admin/settings/min-cart
   */
  deleteMinCartSetting: asyncHandler(async (req, res) => {
    const updated = await settingService.deleteMinCartSetting();
    return ApiResponse.success(res, updated, 'Minimum cart value requirement removed / disabled');
  }),

  /**
   * Add a new preset value
   * POST /api/v1/admin/settings/min-cart/presets
   */
  addPreset: asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(parseFloat(amount))) {
      return ApiResponse.error(res, 'Valid numeric amount is required for preset', 400);
    }
    const updated = await settingService.addPreset(amount);
    return ApiResponse.success(res, updated, `Preset ₹${parseFloat(amount)} added successfully`);
  }),

  /**
   * Remove an existing preset value
   * DELETE /api/v1/admin/settings/min-cart/presets/:amount
   */
  removePreset: asyncHandler(async (req, res) => {
    const { amount } = req.params;
    if (!amount || isNaN(parseFloat(amount))) {
      return ApiResponse.error(res, 'Valid numeric amount is required to remove preset', 400);
    }
    const updated = await settingService.removePreset(amount);
    return ApiResponse.success(res, updated, `Preset ₹${parseFloat(amount)} removed successfully`);
  }),
};

export default settingController;
