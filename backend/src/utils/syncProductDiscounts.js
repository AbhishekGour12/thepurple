import sequelize from '../config/database.js';
import logger from '../config/logger.js';

export const syncProductDiscounts = async () => {
  try {
    await sequelize.query(`
      UPDATE "products"
      SET "discountPercent" = CASE
        WHEN "price" > "salePrice" THEN ROUND((("price" - "salePrice") / "price") * 100)
        ELSE 0
      END;
    `);
    await sequelize.query(`
      UPDATE "product_variants" pv
      SET "mrp" = p."price"
      FROM "products" p
      WHERE pv."productId" = p."id";
    `);
    logger.info('Product discounts and variant MRPs synchronized accurately with salePrice and price.');
  } catch (err) {
    logger.warn('Could not sync product discounts:', err.message);
  }
};
