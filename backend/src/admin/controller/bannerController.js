import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import bannerService from '../services/bannerService.js';

export const listBanners = asyncHandler(async (req, res) => {
  const { placement, bannerType, isActive, search } = req.query;
  const banners = await bannerService.listBanners({ placement, bannerType, isActive, search });
  return ApiResponse.success(res, { banners }, 'Banners retrieved successfully');
});

export const getBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await bannerService.getBannerById(id);
  return ApiResponse.success(res, { banner }, 'Banner retrieved successfully');
});

export const createBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.createBanner(req.body);
  return ApiResponse.created(res, { banner }, 'Banner created successfully');
});

export const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await bannerService.updateBanner(id, req.body);
  return ApiResponse.success(res, { banner }, 'Banner updated successfully');
});

export const updateBannerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const banner = await bannerService.updateBannerStatus(id, isActive);
  return ApiResponse.success(res, { banner }, `Banner ${isActive ? 'activated' : 'deactivated'} successfully`);
});

export const reorderBanners = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const result = await bannerService.reorderBanners(items);
  return ApiResponse.success(res, result, 'Banners reordered successfully');
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await bannerService.deleteBanner(id);
  return ApiResponse.success(res, result, 'Banner deleted successfully');
});

export default {
  listBanners,
  getBanner,
  createBanner,
  updateBanner,
  updateBannerStatus,
  reorderBanners,
  deleteBanner,
};
