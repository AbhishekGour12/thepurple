import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false });

async function check() {
  const [products] = await sequelize.query('SELECT id, name, sku, "salePrice", images FROM products LIMIT 10;');
  console.log('Products in DB:', products);
  const [categories] = await sequelize.query('SELECT id, name, slug FROM categories;');
  console.log('Categories in DB:', categories);
  await sequelize.close();
}

check().catch(console.error);
