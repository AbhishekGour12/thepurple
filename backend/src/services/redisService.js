import { getRedisClient, checkRedisHealth } from '../config/redis.js';
import logger from '../config/logger.js';

export class RedisService {
  constructor() {
    this.client = null;
  }

  getClient() {
    if (!this.client) {
      this.client = getRedisClient();
    }
    return this.client;
  }

  async ensureConnected() {
    const client = this.getClient();
    if (client.status !== 'ready' && client.status !== 'connecting' && client.status !== 'connect') {
      try {
        await client.connect();
      } catch (err) {
        logger.warn(`Redis connection attempt: ${err.message}`);
      }
    }
    return client;
  }

  async set(key, value, ttlSeconds = null) {
    try {
      const client = await this.ensureConnected();
      const stringVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (ttlSeconds) {
        return await client.set(key, stringVal, 'EX', ttlSeconds);
      }
      return await client.set(key, stringVal);
    } catch (err) {
      logger.warn(`Redis set failed for key ${key}: ${err.message}`);
      return null;
    }
  }

  async get(key) {
    try {
      const client = await this.ensureConnected();
      const data = await client.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (err) {
      logger.warn(`Redis get failed for key ${key}: ${err.message}`);
      return null;
    }
  }

  async del(key) {
    try {
      const client = await this.ensureConnected();
      return await client.del(key);
    } catch (err) {
      logger.warn(`Redis del failed for key ${key}: ${err.message}`);
      return 0;
    }
  }

  async healthCheck() {
    return await checkRedisHealth();
  }
}

export const redisService = new RedisService();
export default redisService;
