import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import adminUserService from '../services/adminUserService.js';

export const listAdmins = asyncHandler(async (req, res) => {
  const { page, limit, search, role, status } = req.query;
  const result = await adminUserService.listAdmins({
    page,
    limit,
    search,
    role,
    status,
  });

  return ApiResponse.success(res, result, 'Admins retrieved successfully');
});

export const getAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const admin = await adminUserService.getAdminById(id);
  return ApiResponse.success(res, { admin }, 'Admin retrieved successfully');
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await adminUserService.createAdmin({
    name,
    email,
    role,
    creatorAdminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.created(res, result, 'Administrator created successfully. Welcome credentials have been emailed.');
});

export const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const admin = await adminUserService.updateAdmin(id, {
    name,
    role,
    updaterAdminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, { admin }, 'Administrator updated successfully');
});

export const updateAdminStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const admin = await adminUserService.updateAdminStatus(id, {
    isActive,
    updaterAdminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(
    res,
    { admin },
    `Administrator ${admin.isActive ? 'activated' : 'deactivated'} successfully`
  );
});

export const resetAdminAccess = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await adminUserService.resetAdminAccess(id, {
    updaterAdminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  const result = await adminUserService.deleteAdmin(id, {
    updaterAdminId: req.admin.id,
    ipAddress,
  });

  return ApiResponse.success(res, result, result.message);
});

export default {
  listAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  resetAdminAccess,
  deleteAdmin,
};
