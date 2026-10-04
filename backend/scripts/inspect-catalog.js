import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false });

async function inspect() {
  try {
    const [categories] = await sequelize.query('SELECT id, name, slug FROM categories ORDER BY name;');
    console.log('=== CATEGORIES ===\n', JSON.stringify(categories, null, 2));

    const [subcategories] = await sequelize.query('SELECT id, "categoryId", name, slug FROM subcategories ORDER BY name;');
    console.log('\n=== SUBCATEGORIES ===\n', JSON.stringify(subcategories, null, 2));

    const [products] = await sequelize.query('SELECT id, "subcategoryId", name, slug, sku, price, "salePrice", status, stock FROM products LIMIT 20;');
    console.log('\n=== SAMPLE PRODUCTS ===\n', JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    await sequelize.close();
  }
}

inspect();
