import { hasPermission } from '../permissions/permissions.js';
import AppError from '../../utils/customError.js';

/**
 * Middleware factory to enforce required permission(s).
 * Returns 403 Forbidden if admin's role does not possess the permission.
 *
 * @param {string|string[]} requiredPermissions - single permission or array of permissions (requires all or any)
 * @param {boolean} requireAll - if array passed, true requires all, false requires at least one
 */
export const authorize = (requiredPermissions, requireAll = true) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(AppError.unauthorized('Administrator authentication required.'));
    }

    const adminRole = req.admin.role;
    const permissionsArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    let allowed = false;
    if (requireAll) {
      allowed = permissionsArray.every((perm) => hasPermission(adminRole, perm));
    } else {
      allowed = permissionsArray.some((perm) => hasPermission(adminRole, perm));
    }

    if (!allowed) {
      return next(
        AppError.forbidden(
          `Access denied. Role [${adminRole}] does not have permission to perform this action.`
        )
      );
    }

    next();
  };
};

export default authorize;
