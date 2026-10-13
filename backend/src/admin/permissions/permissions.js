import { ADMIN_ROLES } from '../../models/Admin.js';

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',

  // Product Management
  PRODUCT_VIEW: 'PRODUCT_VIEW',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_EDIT: 'PRODUCT_EDIT',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  PRODUCT_PUBLISH: 'PRODUCT_PUBLISH',
  PRODUCT_BULK_UPLOAD: 'PRODUCT_BULK_UPLOAD',

  // Category & Taxonomy Management
  CATEGORY_VIEW: 'CATEGORY_VIEW',
  CATEGORY_MANAGE: 'CATEGORY_MANAGE',

  // Orders
  ORDER_VIEW: 'ORDER_VIEW',
  ORDER_UPDATE: 'ORDER_UPDATE',

  // Payments
  PAYMENT_VIEW: 'PAYMENT_VIEW',
  PAYMENT_EXPORT: 'PAYMENT_EXPORT',

  // Users / Customers
  USER_VIEW: 'USER_VIEW',
  USER_MANAGE: 'USER_MANAGE',

  // Banners
  BANNER_VIEW: 'BANNER_VIEW',
  BANNER_MANAGE: 'BANNER_MANAGE',

  // Customer Inquiries / Contact
  CONTACT_VIEW: 'CONTACT_VIEW',
  CONTACT_REPLY: 'CONTACT_REPLY',
  CONTACT_MANAGE: 'CONTACT_MANAGE',

  // Coupons Management
  COUPON_VIEW: 'COUPON_VIEW',
  COUPON_MANAGE: 'COUPON_MANAGE',

  // Settings
  SETTINGS_VIEW: 'SETTINGS_VIEW',
  SETTINGS_MANAGE: 'SETTINGS_MANAGE',

  // Admin User Management
  ADMIN_VIEW: 'ADMIN_VIEW',
  ADMIN_CREATE: 'ADMIN_CREATE',
  ADMIN_EDIT: 'ADMIN_EDIT',
  ADMIN_STATUS: 'ADMIN_STATUS',
  ADMIN_RESET_ACCESS: 'ADMIN_RESET_ACCESS',
  ADMIN_DELETE: 'ADMIN_DELETE',
};

/**
 * Role to Permissions mapping
 */
export const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ADMIN_ROLES.MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    // Products view only (cannot add, edit, delete, publish, or bulk upload)
    PERMISSIONS.PRODUCT_VIEW,
    // Categories view only (cannot create, edit, or delete categories/subcategories/attributes)
    PERMISSIONS.CATEGORY_VIEW,
    // Orders view only (cannot cancel or change order status)
    PERMISSIONS.ORDER_VIEW,
    // Payments view only (can see payments received or status)
    PERMISSIONS.PAYMENT_VIEW,
    // Users view only (can view customer accounts)
    PERMISSIONS.USER_VIEW,
    // Customer Inquiries / Contact (can view and reply)
    PERMISSIONS.CONTACT_VIEW,
    PERMISSIONS.CONTACT_REPLY,
    // NO PRODUCT_CREATE, NO PRODUCT_EDIT, NO PRODUCT_DELETE, NO PRODUCT_PUBLISH, NO PRODUCT_BULK_UPLOAD
    // NO CATEGORY_MANAGE
    // NO ORDER_UPDATE
    // NO PAYMENT_EXPORT
    // NO USER_MANAGE
    // NO BANNER_VIEW, NO BANNER_MANAGE
    // NO COUPON_VIEW, NO COUPON_MANAGE
    // NO SETTINGS_VIEW, NO SETTINGS_MANAGE
    // NO ADMIN_*
  ],

  [ADMIN_ROLES.EXECUTIVE]: [
    PERMISSIONS.DASHBOARD_VIEW,
    // Products: Add, View, Edit, Bulk Upload, Publish (CANNOT DELETE)
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.PRODUCT_PUBLISH,
    PERMISSIONS.PRODUCT_BULK_UPLOAD,
    // Categories, Subcategories, Colors, Sizes & Attributes: Full CRUD (Add, Edit, Delete)
    PERMISSIONS.CATEGORY_VIEW,
    PERMISSIONS.CATEGORY_MANAGE,
    // Orders: View only (CANNOT cancel, update status, or generate invoice)
    PERMISSIONS.ORDER_VIEW,
    // Payments: View only
    PERMISSIONS.PAYMENT_VIEW,
    // NO PRODUCT_DELETE
    // NO ORDER_UPDATE
    // NO USERS (NO USER_VIEW, NO USER_MANAGE)
    // NO BANNERS (NO BANNER_VIEW, NO BANNER_MANAGE)
    // NO CONTACT QUERIES (NO CONTACT_VIEW, NO CONTACT_REPLY, NO CONTACT_MANAGE)
    // NO COUPONS (NO COUPON_VIEW, NO COUPON_MANAGE)
    // NO SETTINGS
    // NO ADMIN MANAGEMENT
  ],

  // Backward compatibility alias
  WORKER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.PRODUCT_PUBLISH,
    PERMISSIONS.PRODUCT_BULK_UPLOAD,
    PERMISSIONS.CATEGORY_VIEW,
    PERMISSIONS.CATEGORY_MANAGE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.PAYMENT_VIEW,
  ],
};

/**
 * Check if a role has a given permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Get all permissions granted to a role
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
};
