import bcrypt from 'bcryptjs';
import { Admin } from '../models/index.js';
import { ADMIN_ROLES } from '../models/Admin.js';
import env from '../config/env.js';
import logger from '../config/logger.js';

/**
 * Bootstraps the initial Super Admin account.
 * Creates or updates the super admin with configured email & password.
 */
export async function bootstrapSuperAdmin() {
  try {
    const email = (env.ADMIN_INITIAL_EMAIL || 'superadmin@gmail.com').toLowerCase().trim();
    const initialPassword = env.ADMIN_INITIAL_PASSWORD || '123456';

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(initialPassword, salt);

    let superAdmin = await Admin.findOne({
      where: { email },
    });

    if (superAdmin) {
      await superAdmin.update({
        name: superAdmin.name || 'Super Admin',
        passwordHash,
        role: ADMIN_ROLES.SUPER_ADMIN,
        isActive: true,
        isEmailVerified: true,
        mustChangePassword: false,
      });
      logger.info(`Super Admin account refreshed (${superAdmin.email}) with credentials.`);
      return superAdmin;
    }

    superAdmin = await Admin.create({
      name: 'Super Admin',
      email,
      passwordHash,
      role: ADMIN_ROLES.SUPER_ADMIN,
      isActive: true,
      isEmailVerified: true,
      mustChangePassword: false,
    });

    logger.info(`Super Admin account successfully bootstrapped (${superAdmin.email}) with role [${ADMIN_ROLES.SUPER_ADMIN}]`);
    return superAdmin;
  } catch (error) {
    logger.error(`Error during Super Admin bootstrap: ${error.message}`, { stack: error.stack });
    throw error;
  }
}

export default bootstrapSuperAdmin;
