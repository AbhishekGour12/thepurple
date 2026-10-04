import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false });

async function check() {
  const [categories] = await sequelize.query('SELECT id, name, slug FROM categories ORDER BY name;');
  console.log('=== CATEGORIES ===');
  categories.forEach(c => console.log(`${c.name} (${c.slug}) -> ${c.id}`));

  const [subcategories] = await sequelize.query(`
    SELECT s.id, s.name, s.slug, c.name as category_name 
    FROM subcategories s 
    JOIN categories c ON s."categoryId" = c.id 
    ORDER BY c.name, s.name;
  `);
  console.log('\n=== SUBCATEGORIES ===');
  subcategories.forEach(s => console.log(`[${s.category_name}] ${s.name} (${s.slug}) -> ${s.id}`));
  
  await sequelize.close();
}

check();
