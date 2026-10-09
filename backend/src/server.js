import env from './config/env.js';
import logger from './config/logger.js';
import createApp from './app.js';
import sequelize, { checkDatabaseHealth } from './config/database.js';
import { checkRedisHealth } from './config/redis.js';
import { checkMeiliHealth } from './config/meilisearch.js';
import { workerService } from './services/workerService.js';
import { queueService } from './services/queueService.js';
import { redisService } from './services/redisService.js';
import { shiprocketCronService } from './services/shiprocketCronService.js';
import bootstrapSuperAdmin from './seeders/bootstrapAdmin.js';
import { syncProductDiscounts } from './utils/syncProductDiscounts.js';
import { ProductInterest, ContactQuery } from './models/index.js';
import './models/index.js'; // Register models & associations

const app = createApp();

const startServer = async () => {
  logger.info(`Starting ThePurple API Server in [${env.NODE_ENV}] mode...`);

  // Probe infrastructure dependencies asynchronously
  const [db, redis, meili] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
    checkMeiliHealth(),
  ]);

  logger.info(`Database status: ${db.status} (${db.dialect || 'n/a'})`);
  logger.info(`Redis status: ${redis.status}`);
  logger.info(`Meilisearch status: ${meili.status}`);

  // Sync database schema & run Super Admin bootstrap if database is healthy
  if (db.status === 'healthy') {
    try {
      // Ensure PostgreSQL allows 'FREE_SHIPPING' in coupons table
      try {
        await sequelize.query(`
          DO $$
          BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_coupons_discountType') THEN
              BEGIN
                ALTER TYPE "enum_coupons_discountType" ADD VALUE IF NOT EXISTS 'FREE_SHIPPING';
              EXCEPTION WHEN OTHERS THEN
                NULL;
              END;
            END IF;
            BEGIN
              ALTER TABLE "coupons" ALTER COLUMN "discountType" TYPE VARCHAR(30) USING "discountType"::VARCHAR(30);
            EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
          END$$;
        `);
      } catch (couponErr) {
        logger.warn(`Coupon type update notice: ${couponErr.message}`);
      }

      // Ensure CartItem table allows multiple variants per product in cart (drop legacy unique constraint if present)
      try {
        await sequelize.query(`
          DO $$
          BEGIN
            IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_cart_id_product_id_key') THEN
              ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cart_id_product_id_key";
            END IF;
            IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'cart_items_cart_id_product_id') THEN
              DROP INDEX "cart_items_cart_id_product_id";
            END IF;

            -- product_images columns
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_images') THEN
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_images' AND column_name = 'colorId') THEN
                ALTER TABLE "product_images" ADD COLUMN "colorId" UUID;
              END IF;
            END IF;

            -- cart_items columns
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'variantId') THEN
                ALTER TABLE "cart_items" ADD COLUMN "variantId" UUID;
              END IF;
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'colorId') THEN
                ALTER TABLE "cart_items" ADD COLUMN "colorId" UUID;
              END IF;
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'sizeId') THEN
                ALTER TABLE "cart_items" ADD COLUMN "sizeId" UUID;
              END IF;
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'priceSnapshot') THEN
                ALTER TABLE "cart_items" ADD COLUMN "priceSnapshot" NUMERIC(10,2);
              END IF;
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'selectedColor') THEN
                ALTER TABLE "cart_items" ADD COLUMN "selectedColor" VARCHAR(100);
              END IF;
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'selectedSize') THEN
                ALTER TABLE "cart_items" ADD COLUMN "selectedSize" VARCHAR(100);
              END IF;
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'metaSubtitle') THEN
                ALTER TABLE "cart_items" ADD COLUMN "metaSubtitle" VARCHAR(255);
              END IF;
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'imageUrl') THEN
                ALTER TABLE "cart_items" ADD COLUMN "imageUrl" TEXT;
              END IF;
            END IF;
          EXCEPTION WHEN OTHERS THEN
            NULL;
          END$$;
        `);
      } catch (cartConstraintErr) {
        logger.warn(`Cart constraint & column update notice: ${cartConstraintErr.message}`);
      }

      await sequelize.sync({ alter: false });
      const qi = sequelize.getQueryInterface();
      // Automatic Comprehensive Schema Verification for All Models & Columns
      for (const modelName of Object.keys(sequelize.models)) {
        const model = sequelize.models[modelName];
        const tableName = model.getTableName();
        let tableDesc = {};
        try {
          tableDesc = await qi.describeTable(tableName);
        } catch {
          await model.sync({ alter: true });
          tableDesc = await qi.describeTable(tableName);
        }

        const modelAttributes = model.rawAttributes;
        for (const [attrName, attrDef] of Object.entries(modelAttributes)) {
          if (!tableDesc[attrName]) {
            try {
              await qi.addColumn(tableName, attrName, {
                type: attrDef.type,
                allowNull: attrDef.allowNull !== undefined ? attrDef.allowNull : true,
                defaultValue: attrDef.defaultValue !== undefined ? attrDef.defaultValue : null,
              });
              logger.info(`Added missing column [${attrName}] to table [${tableName}].`);
            } catch {
              try {
                await model.sync({ alter: true });
              } catch { }
            }
          }
        }
      }

      logger.info('Database schema synchronized successfully.');
      await bootstrapSuperAdmin();
      await syncProductDiscounts();
    } catch (bootErr) {
      logger.warn(`Super Admin bootstrap / sync notice: ${bootErr.message}`);
    }
  }

  // Initialize background workers if Redis is ready
  if (redis.status === 'healthy') {
    workerService.initWorkers();
  } else {
    logger.warn('Redis is offline or unreachable; BullMQ background workers paused.');
  }

  // Initialize Shiprocket tracking periodic cron sync service
  try {
    shiprocketCronService.startCronJob();
  } catch (cronErr) {
    logger.warn(`Could not initialize Shiprocket background sync cron: ${cronErr.message}`);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`ThePurple API Server running at http://localhost:${env.PORT}`);
    logger.info(`Health check available at http://localhost:${env.PORT}/api/v1/health`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed.');

      try {
        shiprocketCronService.stopCronJob();
      } catch (e) {
        logger.warn(`Error stopping Shiprocket cron: ${e.message}`);
      }

      try {
        await workerService.closeAll();
        logger.info('BullMQ workers closed.');
      } catch (e) {
        logger.warn(`Error closing workers: ${e.message}`);
      }

      try {
        await queueService.closeAll();
        logger.info('BullMQ queues closed.');
      } catch (e) {
        logger.warn(`Error closing queues: ${e.message}`);
      }

      try {
        await sequelize.close();
        logger.info('Database connection closed.');
      } catch (e) {
        logger.warn(`Error closing database: ${e.message}`);
      }

      process.exit(0);
    });

    // Force shutdown after 10s if dangling connections exist
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`, { stack: error.stack });
  process.exit(1);
});
