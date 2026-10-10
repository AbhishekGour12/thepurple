import bcrypt from 'bcryptjs';
import sequelize from '../src/config/database.js';
import { Admin, User } from '../src/models/index.js';
import { ADMIN_ROLES } from '../src/models/Admin.js';
import env from '../src/config/env.js';

async function updateAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    const newEmail = (env.ADMIN_INITIAL_EMAIL || 'nowthepurple25@gmail.com').toLowerCase().trim();
    const password = env.ADMIN_INITIAL_PASSWORD || '123456';

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 1. Check if nowthepurple25@gmail.com already exists in Admins table
    let admin = await Admin.findOne({ where: { email: newEmail } });
    if (admin) {
      await admin.update({
        name: 'Super Admin',
        passwordHash,
        role: ADMIN_ROLES.SUPER_ADMIN,
        isActive: true,
        isEmailVerified: true,
        mustChangePassword: false,
      });
      console.log(`✅ Updated existing Admin record for: ${newEmail}`);
    } else {
      // Check if there is an old super admin like superadmin@gmail.com
      const oldAdmin = await Admin.findOne({ where: { role: ADMIN_ROLES.SUPER_ADMIN } });
      if (oldAdmin) {
        await oldAdmin.update({
          email: newEmail,
          name: 'Super Admin',
          passwordHash,
          role: ADMIN_ROLES.SUPER_ADMIN,
          isActive: true,
          isEmailVerified: true,
          mustChangePassword: false,
        });
        console.log(`✅ Replaced previous superadmin with: ${newEmail}`);
      } else {
        await Admin.create({
          name: 'Super Admin',
          email: newEmail,
          passwordHash,
          role: ADMIN_ROLES.SUPER_ADMIN,
          isActive: true,
          isEmailVerified: true,
          mustChangePassword: false,
        });
        console.log(`✅ Created new Super Admin record for: ${newEmail}`);
      }
    }

    // 2. Also ensure User table has or updates the super admin
    const userAdmin = await User.findOne({ where: { email: newEmail } });
    if (userAdmin) {
      await userAdmin.update({
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        name: 'Super Admin',
      });
      console.log(`✅ User table record synced for: ${newEmail}`);
    } else {
      const oldUserAdmin = await User.findOne({ where: { role: 'SUPER_ADMIN' } });
      if (oldUserAdmin) {
        await oldUserAdmin.update({
          email: newEmail,
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        });
        console.log(`✅ Updated User table superadmin to: ${newEmail}`);
      } else {
        await User.create({
          name: 'Super Admin',
          email: newEmail,
          mobile: '8966080203',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        });
        console.log(`✅ Created User table record for: ${newEmail}`);
      }
    }

    // List all admins for verification
    const allAdmins = await Admin.findAll({ attributes: ['id', 'email', 'name', 'role', 'isActive'] });
    console.log('\n--- Current Admins in Database ---');
    console.table(allAdmins.map((a) => a.toJSON()));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin:', error);
    process.exit(1);
  }
}

updateAdmin();
