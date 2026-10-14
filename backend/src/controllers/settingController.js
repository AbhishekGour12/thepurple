import settingService from '../services/settingService.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const publicSettingController = {
  /**
   * Public storefront Minimum Cart Value configuration
   * GET /api/v1/cart/min-cart
   */
  getMinCartSetting: asyncHandler(async (req, res) => {
    const config = await settingService.getMinCartSetting();
    return ApiResponse.success(
      res,
      {
        enabled: config.enabled,
        minCartValue: config.enabled ? config.minCartValue : 0,
        presets: config.presets,
        message: config.message,
      },
      'Public minimum cart configuration'
    );
  }),
};

export default publicSettingController;
