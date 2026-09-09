import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import productService from '../services/productService.js';

export const listProducts = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    categoryId,
    subcategoryId,
    status,
    stockStatus,
    minPrice,
    maxPrice,
    sort,
  } = req.query;

  const result = await productService.listProducts({
    page,
    limit,
    search,
    categoryId,
    subcategoryId,
    status,
    stockStatus,
    minPrice,
    maxPrice,
    sort,
  });

  return ApiResponse.success(res, result, 'Products retrieved successfully');
});

export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  return ApiResponse.success(res, { product }, 'Product retrieved successfully');
});

export const createProduct = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  const product = await productService.createProduct({
    ...req.body,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, { product }, 'Product created successfully');
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const product = await productService.updateProduct(id, {
    ...req.body,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, { product }, 'Product updated successfully');
});

export const updateProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const product = await productService.updateProductStatus(id, {
    status,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, { product }, `Product status updated to ${status}`);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await productService.deleteProduct(id, {
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { ids, all } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await productService.bulkDeleteProducts({
    ids,
    all: Boolean(all),
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export default {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  bulkDeleteProducts,
};
