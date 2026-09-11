import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false });

async function check() {
  const [admins] = await sequelize.query('SELECT id, name, email, role, "isActive" FROM admins;');
  console.log('Admins in DB:');
  console.table(admins);

  const [users] = await sequelize.query('SELECT id, name, email, role FROM users;');
  console.log('Users in DB:');
  console.table(users);

  // Check enum values of enum_admins_role
  const [enumAdmins] = await sequelize.query(`
    SELECT enumlabel FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE pg_type.typname = 'enum_admins_role';
  `);
  console.log('enum_admins_role labels:', enumAdmins.map(e => e.enumlabel));

  // Check enum values of enum_users_role
  const [enumUsers] = await sequelize.query(`
    SELECT enumlabel FROM pg_enum 
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
    WHERE pg_type.typname = 'enum_users_role';
  `);
  console.log('enum_users_role labels:', enumUsers.map(e => e.enumlabel));

  await sequelize.close();
}

check().catch(console.error);
