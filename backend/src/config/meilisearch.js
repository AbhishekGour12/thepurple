import { MeiliSearch } from 'meilisearch';
import env from './env.js';
import logger from './logger.js';

let meiliClient = null;

export const getMeiliHost = () => {
  let host = env.MEILISEARCH_HOST || 'http://localhost:7700';
  host = host.trim();
  if (!host.startsWith('http://') && !host.startsWith('https://')) {
    host = `https://${host}`;
  }
  return host.replace(/\/+$/, '');
};

export const getMeiliClient = () => {
  if (!meiliClient) {
    const host = getMeiliHost();
    meiliClient = new MeiliSearch({
      host,
      apiKey: env.MEILISEARCH_MASTER_KEY || '',
      timeout: 10000, // 10s timeout for Render cold boots
    });
  }
  return meiliClient;
};

export const INDEX_NAMES = {
  PRODUCTS: `${env.MEILISEARCH_INDEX_PREFIX || 'thepurple'}_products`,
  CATEGORIES: `${env.MEILISEARCH_INDEX_PREFIX || 'thepurple'}_categories`,
};

export const checkMeiliHealth = async () => {
  try {
    const host = getMeiliHost();
    if (host.includes('localhost') && env.NODE_ENV === 'production') {
      logger.warn('Meilisearch host is set to localhost in production. Please set MEILISEARCH_HOST in environment variables.');
      return {
        status: 'unhealthy',
        error: 'MEILISEARCH_HOST is localhost in production',
      };
    }

    const client = getMeiliClient();
    const startTime = Date.now();
    const health = await client.health();
    const latency = Date.now() - startTime;
    return {
      status: health?.status === 'available' ? 'healthy' : 'degraded',
      latencyMs: latency,
      details: health,
    };
  } catch (error) {
    logger.warn(`Meilisearch health check failed (${getMeiliHost()}): ${error.message}`);
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
};

export default getMeiliClient;
