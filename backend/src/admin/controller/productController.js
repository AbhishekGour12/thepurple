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
    minStock,
    maxStock,
    minDiscount,
    maxDiscount,
    brand,
    isFeatured,
    isBestSeller,
    isBulk,
    tags,
    startDate,
    endDate,
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
    minStock,
    maxStock,
    minDiscount,
    maxDiscount,
    brand,
    isFeatured,
    isBestSeller,
    isBulk,
    tags,
    startDate,
    endDate,
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

export const deleteProductImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await productService.deleteProductImage(id, imageId, {
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const exportProducts = asyncHandler(async (req, res) => {
  const {
    search,
    categoryId,
    subcategoryId,
    status,
    stockStatus,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    format = 'json',
  } = req.query;

  const data = await productService.exportProducts({
    search,
    categoryId,
    subcategoryId,
    status,
    stockStatus,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
  });

  if (format === 'csv') {
    if (!data.length) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="products-export.csv"');
      return res.status(200).send('SKU,Product Name,Slug,Category,Subcategory,Price,Sale Price,Discount %,Stock,Status,Rating,Reviews,Date\n');
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const val = row[fieldName] !== undefined && row[fieldName] !== null ? String(row[fieldName]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="products-export-${Date.now()}.csv"`);
    return res.status(200).send(csvRows.join('\n'));
  }

  return ApiResponse.success(res, { products: data, total: data.length }, 'Products exported successfully');
});

export default {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  deleteProductImage,
  bulkDeleteProducts,
  exportProducts,
};
