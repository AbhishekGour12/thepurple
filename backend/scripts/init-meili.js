import meiliService from '../src/services/meiliService.js';
import logger from '../src/config/logger.js';

async function main() {
  logger.info('Initializing Meilisearch product index and configuration...');
  const success = await meiliService.configureProductIndex();
  if (success) {
    logger.info('Meilisearch index setup completed successfully.');
    process.exit(0);
  } else {
    logger.warn('Meilisearch index setup could not complete (Meilisearch might be offline).');
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error(`Meilisearch init error: ${err.message}`);
  process.exit(1);
});
