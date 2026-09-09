import { MeiliSearch } from 'meilisearch';
import env from './env.js';
import logger from './logger.js';

let meiliClient = null;

export const getMeiliClient = () => {
  if (!meiliClient) {
    meiliClient = new MeiliSearch({
      host: env.MEILISEARCH_HOST,
      apiKey: env.MEILISEARCH_MASTER_KEY,
    });
  }
  return meiliClient;
};

export const INDEX_NAMES = {
  PRODUCTS: `${env.MEILISEARCH_INDEX_PREFIX}_products`,
  CATEGORIES: `${env.MEILISEARCH_INDEX_PREFIX}_categories`,
};

export const checkMeiliHealth = async () => {
  try {
    const client = getMeiliClient();
    const startTime = Date.now();
    const health = await client.health();
    const latency = Date.now() - startTime;
    return {
      status: health.status === 'available' ? 'healthy' : 'degraded',
      latencyMs: latency,
      details: health,
    };
  } catch (error) {
    logger.warn(`Meilisearch health check failed: ${error.message}`);
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
};

export default getMeiliClient;
