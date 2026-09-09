import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import attributeService from '../services/attributeService.js';

// Colors
export const listColors = asyncHandler(async (req, res) => {
  const colors = await attributeService.listColors();
  return ApiResponse.success(res, { colors }, 'Colors retrieved successfully');
});

export const createColor = asyncHandler(async (req, res) => {
  const { name, hexCode, isActive, displayOrder } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const color = await attributeService.createColor({
    name,
    hexCode,
    isActive,
    displayOrder,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, { color }, 'Color created successfully');
});

export const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, hexCode, isActive, displayOrder } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const color = await attributeService.updateColor(id, {
    name,
    hexCode,
    isActive,
    displayOrder,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, { color }, 'Color updated successfully');
});

export const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await attributeService.deleteColor(id, {
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

// Sizes
export const listSizes = asyncHandler(async (req, res) => {
  const sizes = await attributeService.listSizes();
  return ApiResponse.success(res, { sizes }, 'Sizes retrieved successfully');
});

export const createSize = asyncHandler(async (req, res) => {
  const { name, code, isActive, displayOrder } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const size = await attributeService.createSize({
    name,
    code,
    isActive,
    displayOrder,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, { size }, 'Size created successfully');
});

export const updateSize = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, isActive, displayOrder } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const size = await attributeService.updateSize(id, {
    name,
    code,
    isActive,
    displayOrder,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, { size }, 'Size updated successfully');
});

export const deleteSize = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await attributeService.deleteSize(id, {
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

// Attributes
export const listAttributes = asyncHandler(async (req, res) => {
  const attributes = await attributeService.listAttributes();
  return ApiResponse.success(res, { attributes }, 'Attributes retrieved successfully');
});

export const createAttribute = asyncHandler(async (req, res) => {
  const { name, slug, isActive, values } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const attribute = await attributeService.createAttribute({
    name,
    slug,
    isActive,
    values,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, { attribute }, 'Attribute created successfully');
});

export const addAttributeValue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { value, slug, isActive } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const attrValue = await attributeService.addAttributeValue(id, {
    value,
    slug,
    isActive,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, { attributeValue: attrValue }, 'Attribute value added successfully');
});

export const bulkCreateColors = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const colors = await attributeService.bulkCreateColors({
    items,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, { colors }, 'Colors created successfully');
});

export const bulkCreateSizes = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const sizes = await attributeService.bulkCreateSizes({
    items,
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, { sizes }, 'Sizes created successfully');
});

export const deleteAttribute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await attributeService.deleteAttribute(id, {
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const deleteAttributeValue = asyncHandler(async (req, res) => {
  const { id, valueId } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await attributeService.deleteAttributeValue(id, valueId, {
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const bulkDeleteColors = asyncHandler(async (req, res) => {
  const { ids, all } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await attributeService.bulkDeleteColors({
    ids,
    all: Boolean(all),
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const bulkDeleteSizes = asyncHandler(async (req, res) => {
  const { ids, all } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await attributeService.bulkDeleteSizes({
    ids,
    all: Boolean(all),
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const bulkDeleteAttributes = asyncHandler(async (req, res) => {
  const { ids, all } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await attributeService.bulkDeleteAttributes({
    ids,
    all: Boolean(all),
    adminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export default {
  listColors,
  createColor,
  updateColor,
  deleteColor,
  bulkCreateColors,
  bulkDeleteColors,
  listSizes,
  createSize,
  updateSize,
  deleteSize,
  bulkCreateSizes,
  bulkDeleteSizes,
  listAttributes,
  createAttribute,
  addAttributeValue,
  deleteAttribute,
  deleteAttributeValue,
  bulkDeleteAttributes,
};
