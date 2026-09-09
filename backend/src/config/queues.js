import { getRedisOptions } from './redis.js';

export const QUEUE_NAMES = {
  TEST_QUEUE: 'thepurple-test-queue',
  ORDER_PROCESSING: 'thepurple-order-processing',
  SEARCH_INDEX: 'thepurple-search-index',
  NOTIFICATIONS: 'thepurple-notifications',
  IMAGE_PROCESSING: 'thepurple-image-processing',
  BULK_IMPORT: 'thepurple-bulk-import',
};

export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: {
    age: 3600, // keep for 1 hour
    count: 100, // keep last 100
  },
  removeOnFail: {
    age: 86400, // keep for 24 hours
    count: 200,
  },
};

export const getQueueConnection = () => {
  return getRedisOptions();
};
