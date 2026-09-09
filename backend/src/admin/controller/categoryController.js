import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import categoryService from '../services/categoryService.js';
import subcategoryService from '../services/subcategoryService.js';

// Category Controllers
export const listCategories = asyncHandler(async (req, res) => {
  const { search, isActive } = req.query;
  const categories = await categoryService.listCategories({ search, isActive });
  return ApiResponse.success(res, { categories }, 'Categories retrieved successfully');
});

export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id);
  return ApiResponse.success(res, { category }, 'Category retrieved successfully');
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, imageUrl, isActive, displayOrder } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const category = await categoryService.createCategory({
    name,
    slug,
    description,
    imageUrl,
    isActive,
    displayOrder,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, { category }, 'Category created successfully');
});

export const bulkCreateCategories = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const categories = await categoryService.bulkCreateCategories({
    items,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, { categories }, 'Categories and subcategories created successfully');
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, imageUrl, isActive, displayOrder } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const category = await categoryService.updateCategory(id, {
    name,
    slug,
    description,
    imageUrl,
    isActive,
    displayOrder,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, { category }, 'Category updated successfully');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await categoryService.deleteCategory(id, {
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

// Subcategory Controllers
export const listSubcategories = asyncHandler(async (req, res) => {
  const { categoryId, search, isActive } = req.query;
  const subcategories = await subcategoryService.listSubcategories({
    categoryId,
    search,
    isActive,
  });
  return ApiResponse.success(res, { subcategories }, 'Subcategories retrieved successfully');
});

export const getSubcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subcategory = await subcategoryService.getSubcategoryById(id);
  return ApiResponse.success(res, { subcategory }, 'Subcategory retrieved successfully');
});

export const createSubcategory = asyncHandler(async (req, res) => {
  const { categoryId, name, slug, description, imageUrl, isActive, displayOrder } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const subcategory = await subcategoryService.createSubcategory({
    categoryId,
    name,
    slug,
    description,
    imageUrl,
    isActive,
    displayOrder,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, { subcategory }, 'Subcategory created successfully');
});

export const updateSubcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { categoryId, name, slug, description, imageUrl, isActive, displayOrder } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const subcategory = await subcategoryService.updateSubcategory(id, {
    categoryId,
    name,
    slug,
    description,
    imageUrl,
    isActive,
    displayOrder,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, { subcategory }, 'Subcategory updated successfully');
});

export const deleteSubcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await subcategoryService.deleteSubcategory(id, {
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const bulkDeleteCategories = asyncHandler(async (req, res) => {
  const { ids, all, cascade } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await categoryService.bulkDeleteCategories({
    ids,
    all: Boolean(all),
    cascade: cascade !== undefined ? Boolean(cascade) : true,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const bulkDeleteSubcategories = asyncHandler(async (req, res) => {
  const { ids, all } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await subcategoryService.bulkDeleteSubcategories({
    ids,
    all: Boolean(all),
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export default {
  listCategories,
  getCategory,
  createCategory,
  bulkCreateCategories,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  listSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  bulkDeleteSubcategories,
};
