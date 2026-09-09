import sequelize from '../src/config/database.js';

async function addBulkColumns() {
  try {
    await sequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "isBulk" BOOLEAN DEFAULT false;`);
    await sequelize.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS "minOrderQuantity" INTEGER DEFAULT 1;`);
    console.log('Columns isBulk and minOrderQuantity added successfully to products table!');
    process.exit(0);
  } catch (err) {
    console.error('Error adding columns:', err);
    process.exit(1);
  }
}

addBulkColumns();
