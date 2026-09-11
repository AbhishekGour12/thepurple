import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { Admin, AuditLog, AdminSession } from '../../models/index.js';
import { ADMIN_ROLES } from '../../models/Admin.js';
import AppError from '../../utils/customError.js';
import mailService from '../../services/mailService.js';
import env from '../../config/env.js';

/**
 * Generate a cryptographically secure random temporary password
 */
function generateTemporaryPassword(length = 12) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%&*';
  const all = upper + lower + numbers + special;

  let pwd = '';
  pwd += upper[crypto.randomInt(0, upper.length)];
  pwd += lower[crypto.randomInt(0, lower.length)];
  pwd += numbers[crypto.randomInt(0, numbers.length)];
  pwd += special[crypto.randomInt(0, special.length)];

  for (let i = 4; i < length; i++) {
    pwd += all[crypto.randomInt(0, all.length)];
  }

  // Shuffle
  return pwd
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

export const adminUserService = {
  /**
   * List all admin users with search, role filter, status filter, and pagination
   */
  async listAdmins({ page = 1, limit = 20, search, role, status }) {
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const where = {};

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: q } },
        { email: { [Op.iLike]: q } },
      ];
    }

    if (role && Object.values(ADMIN_ROLES).includes(role)) {
      where.role = role;
    }

    if (status !== undefined && status !== '') {
      where.isActive = status === 'true' || status === true;
    }

    const { count, rows } = await Admin.findAndCountAll({
      where,
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'isEmailVerified',
        'mustChangePassword',
        'lastLoginAt',
        'createdAt',
        'updatedAt',
      ],
      order: [
        ['createdAt', 'DESC'],
      ],
      limit: parseInt(limit, 10),
      offset,
    });

    return {
      admins: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count / parseInt(limit, 10)) || 1,
      },
    };
  },

  /**
   * Get single admin user
   */
  async getAdminById(id) {
    const admin = await Admin.findByPk(id, {
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'isEmailVerified',
        'mustChangePassword',
        'lastLoginAt',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!admin) {
      throw AppError.notFound('Administrator not found');
    }

    return admin;
  },

  /**
   * Create new admin user (Manager or Worker only)
   */
  async createAdmin({ name, email, role, creatorAdminId, ipAddress }) {
    if (!name || !email || !role) {
      throw AppError.badRequest('Name, email, and role are required');
    }

    const targetRole = role === 'WORKER' ? ADMIN_ROLES.EXECUTIVE : role;

    // Role MUST be MANAGER or EXECUTIVE only
    if (![ADMIN_ROLES.MANAGER, ADMIN_ROLES.EXECUTIVE].includes(targetRole)) {
      throw AppError.badRequest('Admin role must be either MANAGER or EXECUTIVE');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check email uniqueness
    const existing = await Admin.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw AppError.badRequest('An administrator with this email already exists');
    }

    // Generate auto-password
    const temporaryPassword = generateTemporaryPassword(12);
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    const admin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: targetRole,
      isActive: true,
      isEmailVerified: true,
      mustChangePassword: true,
    });

    // Send welcome email with temporary password
    const loginUrl = `${env.FRONTEND_URL}/admin/login`;
    await mailService.sendWelcomeAdminEmail({
      toEmail: admin.email,
      adminName: admin.name,
      role: admin.role,
      temporaryPassword,
      loginUrl,
    });

    // Record audit log
    await AuditLog.create({
      adminId: creatorAdminId,
      action: 'ADMIN_USER_CREATED',
      entity: 'Admin',
      entityId: admin.id,
      metadata: { createdEmail: admin.email, createdRole: admin.role },
      ipAddress: ipAddress || null,
    });

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        mustChangePassword: admin.mustChangePassword,
        createdAt: admin.createdAt,
      },
      // In dev mode, provide temporary password for test verification
      ...(env.isDevelopment ? { debugTemporaryPassword: temporaryPassword } : {}),
    };
  },

  /**
   * Update admin name or role
   */
  async updateAdmin(id, { name, role, updaterAdminId, ipAddress }) {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      throw AppError.notFound('Administrator not found');
    }

    // Protect Super Admin from role changes or demotions
    if (admin.role === ADMIN_ROLES.SUPER_ADMIN && role && role !== ADMIN_ROLES.SUPER_ADMIN) {
      throw AppError.badRequest('Cannot change the role of a Super Admin');
    }

    // Super Admin cannot promote someone to Super Admin via UI
    if (role && role === ADMIN_ROLES.SUPER_ADMIN && admin.role !== ADMIN_ROLES.SUPER_ADMIN) {
      throw AppError.badRequest('Cannot assign Super Admin role from Admin Panel');
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (role && [ADMIN_ROLES.MANAGER, ADMIN_ROLES.EXECUTIVE, 'WORKER'].includes(role)) {
      updates.role = role === 'WORKER' ? ADMIN_ROLES.EXECUTIVE : role;
    }

    await admin.update(updates);

    await AuditLog.create({
      adminId: updaterAdminId,
      action: 'ADMIN_USER_UPDATED',
      entity: 'Admin',
      entityId: admin.id,
      metadata: updates,
      ipAddress: ipAddress || null,
    });

    return admin;
  },

  /**
   * Activate / Deactivate admin status
   */
  async updateAdminStatus(id, { isActive, updaterAdminId, ipAddress }) {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      throw AppError.notFound('Administrator not found');
    }

    // Prevent deactivating the only/current Super Admin
    if (admin.role === ADMIN_ROLES.SUPER_ADMIN && !isActive) {
      const activeSuperAdmins = await Admin.count({
        where: { role: ADMIN_ROLES.SUPER_ADMIN, isActive: true },
      });
      if (activeSuperAdmins <= 1) {
        throw AppError.badRequest('Cannot deactivate the only active Super Admin');
      }
    }

    await admin.update({ isActive });

    // If deactivated, revoke all active sessions
    if (!isActive) {
      await AdminSession.update(
        { revokedAt: new Date() },
        { where: { adminId: admin.id, revokedAt: null } }
      );
    }

    await AuditLog.create({
      adminId: updaterAdminId,
      action: isActive ? 'ADMIN_USER_ACTIVATED' : 'ADMIN_USER_DEACTIVATED',
      entity: 'Admin',
      entityId: admin.id,
      metadata: { isActive },
      ipAddress: ipAddress || null,
    });

    return admin;
  },

  /**
   * Reset Admin Access (generate new temporary password and email it)
   */
  async resetAdminAccess(id, { updaterAdminId, ipAddress }) {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      throw AppError.notFound('Administrator not found');
    }

    const temporaryPassword = generateTemporaryPassword(12);
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    await admin.update({
      passwordHash,
      mustChangePassword: true,
    });

    // Revoke all active sessions
    await AdminSession.update(
      { revokedAt: new Date() },
      { where: { adminId: admin.id, revokedAt: null } }
    );

    // Send email
    const loginUrl = `${env.FRONTEND_URL}/admin/login`;
    await mailService.sendWelcomeAdminEmail({
      toEmail: admin.email,
      adminName: admin.name,
      role: admin.role,
      temporaryPassword,
      loginUrl,
    });

    await AuditLog.create({
      adminId: updaterAdminId,
      action: 'ADMIN_ACCESS_RESET',
      entity: 'Admin',
      entityId: admin.id,
      ipAddress: ipAddress || null,
    });

    return {
      message: 'Access has been reset. A new temporary password was sent to the administrator.',
      ...(env.isDevelopment ? { debugTemporaryPassword: temporaryPassword } : {}),
    };
  },

  /**
   * Delete Admin user (Super Admin only, cannot delete self or Super Admin)
   */
  async deleteAdmin(id, { updaterAdminId, ipAddress }) {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      throw AppError.notFound('Administrator not found');
    }

    if (admin.role === ADMIN_ROLES.SUPER_ADMIN) {
      throw AppError.badRequest('Cannot delete a Super Admin account');
    }

    if (admin.id === updaterAdminId) {
      throw AppError.badRequest('Cannot delete your own account');
    }

    // Revoke sessions first
    await AdminSession.destroy({ where: { adminId: admin.id } });

    // Delete admin record
    await admin.destroy();

    await AuditLog.create({
      adminId: updaterAdminId,
      action: 'ADMIN_USER_DELETED',
      entity: 'Admin',
      entityId: id,
      metadata: { name: admin.name, email: admin.email, role: admin.role },
      ipAddress: ipAddress || null,
    });

    return { message: `Administrator ${admin.name} (${admin.email}) has been permanently deleted` };
  },
};

export default adminUserService;
