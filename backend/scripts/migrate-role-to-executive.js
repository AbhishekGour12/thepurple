import sequelize from '../src/config/database.js';

async function updateWorkerToExecutiveInDB() {
  try {
    console.log('Updating database roles to EXECUTIVE...');

    // 1. Add EXECUTIVE to enum_admins_role if not exists
    try {
      await sequelize.query(`ALTER TYPE "enum_admins_role" ADD VALUE IF NOT EXISTS 'EXECUTIVE';`);
      console.log('Added EXECUTIVE to enum_admins_role');
    } catch (e) {
      console.log('enum_admins_role alter note:', e.message);
    }

    // 2. Add EXECUTIVE to enum_users_role if exists
    try {
      await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'EXECUTIVE';`);
      console.log('Added EXECUTIVE to enum_users_role');
    } catch (e) {
      console.log('enum_users_role alter note:', e.message);
    }

    // 3. Update admins table
    const [adminUpdateRes] = await sequelize.query(`UPDATE admins SET role = 'EXECUTIVE' WHERE role = 'WORKER';`);
    console.log('Updated admins table rows to EXECUTIVE:', adminUpdateRes);

    // 4. Update users table if any
    try {
      const [userUpdateRes] = await sequelize.query(`UPDATE users SET role = 'EXECUTIVE' WHERE role = 'WORKER';`);
      console.log('Updated users table rows to EXECUTIVE:', userUpdateRes);
    } catch (e) {}

    // Verify
    const [admins] = await sequelize.query(`SELECT id, name, email, role FROM admins;`);
    console.log('Current Admins in DB:', admins);

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

updateWorkerToExecutiveInDB();
