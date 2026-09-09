import { Router } from 'express';
import authenticateAdmin from '../middlewares/authenticateAdmin.js';
import authorize from '../middlewares/authorize.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { PERMISSIONS } from '../permissions/permissions.js';

// Controllers
import authController from '../controller/authController.js';
import adminUserController from '../controller/adminUserController.js';
import categoryController from '../controller/categoryController.js';
import attributeController from '../controller/attributeController.js';
import productController from '../controller/productController.js';
import bulkUploadController from '../controller/bulkUploadController.js';
import uploadController from '../controller/uploadController.js';

const router = Router();

// ─── 1. Authentication Endpoints ─────────────────────────────────────
router.post('/auth/login', authRateLimiter, authController.login);
router.post('/auth/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/auth/reset-password', authRateLimiter, authController.resetPassword);
router.post('/auth/change-password', authenticateAdmin, authController.changePassword);
router.post('/auth/logout', authenticateAdmin, authController.logout);
router.get('/auth/me', authenticateAdmin, authController.getMe);

// ─── 2. Admin User Management (Super Admin Only) ─────────────────────
router.get(
  '/admins',
  authenticateAdmin,
  authorize(PERMISSIONS.ADMIN_VIEW),
  adminUserController.listAdmins
);
router.post(
  '/admins',
  authenticateAdmin,
  authorize(PERMISSIONS.ADMIN_CREATE),
  adminUserController.createAdmin
);
router.get(
  '/admins/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.ADMIN_VIEW),
  adminUserController.getAdmin
);
router.patch(
  '/admins/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.ADMIN_EDIT),
  adminUserController.updateAdmin
);
router.patch(
  '/admins/:id/status',
  authenticateAdmin,
  authorize(PERMISSIONS.ADMIN_STATUS),
  adminUserController.updateAdminStatus
);
router.post(
  '/admins/:id/reset-access',
  authenticateAdmin,
  authorize(PERMISSIONS.ADMIN_RESET_ACCESS),
  adminUserController.resetAdminAccess
);
router.delete(
  '/admins/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.ADMIN_DELETE),
  adminUserController.deleteAdmin
);

// ─── 3. Categories Management ────────────────────────────────────────
router.get(
  '/categories',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_VIEW),
  categoryController.listCategories
);
router.post(
  '/categories',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_MANAGE),
  categoryController.createCategory
);
router.post(
  '/categories/bulk',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_MANAGE),
  categoryController.bulkCreateCategories
);
router.delete(
  '/categories/bulk',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_MANAGE),
  categoryController.bulkDeleteCategories
);
router.get(
  '/categories/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_VIEW),
  categoryController.getCategory
);
router.patch(
  '/categories/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_MANAGE),
  categoryController.updateCategory
);
router.delete(
  '/categories/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_MANAGE),
  categoryController.deleteCategory
);

// ─── 4. Subcategories Management ─────────────────────────────────────
router.get(
  '/subcategories',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_VIEW),
  categoryController.listSubcategories
);
router.post(
  '/subcategories',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_MANAGE),
  categoryController.createSubcategory
);
router.delete(
  '/subcategories/bulk',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_MANAGE),
  categoryController.bulkDeleteSubcategories
);
router.get(
  '/subcategories/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_VIEW),
  categoryController.getSubcategory
);
router.patch(
  '/subcategories/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_MANAGE),
  categoryController.updateSubcategory
);
router.delete(
  '/subcategories/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.CATEGORY_MANAGE),
  categoryController.deleteSubcategory
);

// ─── 5. Colors, Sizes & Dynamic Attributes ───────────────────────────
router.get('/colors', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_VIEW), attributeController.listColors);
router.post('/colors', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.createColor);
router.post('/colors/bulk', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.bulkCreateColors);
router.delete('/colors/bulk', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.bulkDeleteColors);
router.patch('/colors/:id', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.updateColor);
router.delete('/colors/:id', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.deleteColor);

router.get('/sizes', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_VIEW), attributeController.listSizes);
router.post('/sizes', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.createSize);
router.post('/sizes/bulk', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.bulkCreateSizes);
router.delete('/sizes/bulk', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.bulkDeleteSizes);
router.patch('/sizes/:id', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.updateSize);
router.delete('/sizes/:id', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.deleteSize);

router.get('/attributes', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_VIEW), attributeController.listAttributes);
router.post('/attributes', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.createAttribute);
router.delete('/attributes/bulk', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.bulkDeleteAttributes);
router.delete('/attributes/:id', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.deleteAttribute);
router.post('/attributes/:id/values', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.addAttributeValue);
router.delete('/attributes/:id/values/:valueId', authenticateAdmin, authorize(PERMISSIONS.CATEGORY_MANAGE), attributeController.deleteAttributeValue);

// ─── 6. Bulk Product Upload & Templates ──────────────────────────────
router.get(
  '/products/bulk/template',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_VIEW),
  bulkUploadController.downloadTemplate
);
router.post(
  '/products/bulk/validate',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_BULK_UPLOAD),
  bulkUploadController.bulkFileUploadMiddleware,
  bulkUploadController.validateBulkFile
);
router.post(
  '/products/bulk/import',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_BULK_UPLOAD),
  bulkUploadController.bulkFileUploadMiddleware,
  bulkUploadController.executeBulkImport
);
router.get(
  '/products/bulk/jobs/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_VIEW),
  bulkUploadController.getImportStatus
);
router.get(
  '/products/bulk/history',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_VIEW),
  bulkUploadController.listImportHistory
);

// ─── 7. Image Uploads (Cloudflare R2) ─────────────────────────────────
router.post(
  '/upload/image',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_CREATE),
  uploadController.uploadSingleImageMiddleware,
  uploadController.uploadImage
);
router.post(
  '/upload/images',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_CREATE),
  uploadController.uploadMultipleImagesMiddleware,
  uploadController.uploadMultipleImages
);

// ─── 8. Product CRUD Endpoints ───────────────────────────────────────
router.get(
  '/products',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_VIEW),
  productController.listProducts
);
router.post(
  '/products',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_CREATE),
  productController.createProduct
);
router.delete(
  '/products/bulk',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_DELETE),
  productController.bulkDeleteProducts
);
router.get(
  '/products/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_VIEW),
  productController.getProduct
);
router.patch(
  '/products/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_EDIT),
  productController.updateProduct
);
router.patch(
  '/products/:id/status',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_PUBLISH),
  productController.updateProductStatus
);
router.delete(
  '/products/:id',
  authenticateAdmin,
  authorize(PERMISSIONS.PRODUCT_DELETE),
  productController.deleteProduct
);

export default router;
