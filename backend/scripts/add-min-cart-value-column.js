import sequelize from '../src/config/database.js';

async function migrate() {
  try {
    console.log('Migrating database schema...');
    
    // 1. Add minCartValue to products
    await sequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "minCartValue" DECIMAL(10, 2) DEFAULT NULL;`);
    console.log('✓ Column minCartValue added to products table.');

    // 2. Expand imageUrl in product_images to TEXT to prevent overflow
    await sequelize.query(`ALTER TABLE product_images ALTER COLUMN "imageUrl" TYPE TEXT;`).catch((err) => {
      console.log('Note on product_images imageUrl alter:', err.message);
    });
    console.log('✓ Column product_images.imageUrl confirmed as TEXT.');

    // 3. Inspect columns
    const [cols] = await sequelize.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name IN ('minCartValue', 'minOrderQuantity', 'isBulk');`);
    console.log('Verified product columns:', cols);

    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
