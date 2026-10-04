import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false });

async function verify() {
  const [products] = await sequelize.query(`
    SELECT p.id, p.name, p.sku, p.slug, p.price, p."salePrice", p.status, p.stock, pi."imageUrl"
    FROM products p
    LEFT JOIN product_images pi ON pi."productId" = p.id AND pi."isPrimary" = true
    WHERE p.sku LIKE 'TP-CRO%' OR p.sku LIKE 'TP-CLAT%' OR p.sku LIKE 'TP-KEY%'
    ORDER BY p."createdAt" DESC;
  `);

  console.log('=== VERIFIED INSERTED PRODUCTS ===');
  console.table(products);

  await sequelize.close();
}

verify();
