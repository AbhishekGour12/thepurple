import env from './config/env.js';
import logger from './config/logger.js';
import createApp from './app.js';
import sequelize, { checkDatabaseHealth } from './config/database.js';
import { checkRedisHealth } from './config/redis.js';
import { checkMeiliHealth } from './config/meilisearch.js';
import { workerService } from './services/workerService.js';
import { queueService } from './services/queueService.js';
import { redisService } from './services/redisService.js';
import bootstrapSuperAdmin from './seeders/bootstrapAdmin.js';
import { syncProductDiscounts } from './utils/syncProductDiscounts.js';
import { ProductInterest } from './models/index.js';
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
      await sequelize.sync({ alter: false });
      // Ensure isFeatured column exists in categories table safely
      try {
        const qi = sequelize.getQueryInterface();
        const catDesc = await qi.describeTable('categories');
        if (!catDesc.isFeatured) {
          await qi.addColumn('categories', 'isFeatured', {
            type: sequelize.Sequelize.BOOLEAN,
            defaultValue: false,
          });
          logger.info('Added isFeatured column to categories table.');
        }

        // Ensure banners table has all rich slide columns
        const bannerDesc = await qi.describeTable('banners');
        const newCols = [
          { name: 'placement', type: sequelize.Sequelize.STRING(50), defaultValue: 'HOME_HERO' },
          { name: 'highlight', type: sequelize.Sequelize.STRING(150), defaultValue: null },
          { name: 'badge', type: sequelize.Sequelize.STRING(100), defaultValue: null },
          { name: 'description', type: sequelize.Sequelize.TEXT, defaultValue: null },
          { name: 'primaryBtnText', type: sequelize.Sequelize.STRING(100), defaultValue: null },
          { name: 'primaryBtnUrl', type: sequelize.Sequelize.STRING(500), defaultValue: null },
          { name: 'secondaryBtnText', type: sequelize.Sequelize.STRING(100), defaultValue: null },
          { name: 'secondaryBtnUrl', type: sequelize.Sequelize.STRING(500), defaultValue: null },
          { name: 'accentColor', type: sequelize.Sequelize.STRING(50), defaultValue: '#7E22CE' },
          { name: 'bgGradient', type: sequelize.Sequelize.STRING(255), defaultValue: null },
          { name: 'couponCode', type: sequelize.Sequelize.STRING(50), defaultValue: null },
          { name: 'discountTag', type: sequelize.Sequelize.STRING(100), defaultValue: null },
          { name: 'isFullImage', type: sequelize.Sequelize.BOOLEAN, defaultValue: false },
        ];

        for (const col of newCols) {
          if (!bannerDesc[col.name]) {
            await qi.addColumn('banners', col.name, {
              type: col.type,
              defaultValue: col.defaultValue,
              allowNull: true,
            });
            logger.info(`Added ${col.name} column to banners table.`);
          }
        }

        // Ensure products table has badge column
        const prodDesc = await qi.describeTable('products');
        if (!prodDesc.badge) {
          await qi.addColumn('products', 'badge', {
            type: sequelize.Sequelize.STRING(100),
            defaultValue: null,
            allowNull: true,
          });
          logger.info('Added badge column to products table.');
        }

        // Ensure product_interests table is created
        await ProductInterest.sync({ alter: true });
        logger.info('ProductInterest table verified.');
      } catch (colErr) {
        logger.debug?.(`Column check note: ${colErr.message}`);
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

// ThePurple Backend API Server

