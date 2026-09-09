import sequelize from '../config/database.js';

async function migrate() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected. Altering users table...');

    await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "googleId" VARCHAR(150) UNIQUE;');
    await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" VARCHAR(500);');
    await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "authProvider" VARCHAR(50) DEFAULT \'GOOGLE\';');
    await sequelize.query('ALTER TABLE "users" ALTER COLUMN "mobile" DROP NOT NULL;');

    console.log('Successfully added Google OAuth columns to users table!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
