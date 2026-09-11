import env from '../config/env.js';
import { checkDatabaseHealth } from '../config/database.js';
import { checkRedisHealth } from '../config/redis.js';
import { checkMeiliHealth } from '../config/meilisearch.js';
import { queueService } from '../services/queueService.js';
import { QUEUE_NAMES } from '../config/queues.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  // Run health checks in parallel with safety guards
  const [dbHealth, redisHealth, meiliHealth] = await Promise.all([
    checkDatabaseHealth().catch((err) => ({ status: 'unhealthy', error: err.message })),
    checkRedisHealth().catch((err) => ({ status: 'unhealthy', error: err.message })),
    checkMeiliHealth().catch((err) => ({ status: 'unhealthy', error: err.message })),
  ]);

  let queueHealth = { status: 'idle' };
  if (redisHealth.status === 'healthy') {
    try {
      const metrics = await queueService.getQueueMetrics(QUEUE_NAMES.TEST_QUEUE);
      queueHealth = {
        status: 'healthy',
        testQueueCounts: metrics,
      };
    } catch (err) {
      queueHealth = { status: 'unhealthy', error: err.message };
    }
  } else {
    queueHealth = { status: 'degraded', reason: 'Redis unavailable' };
  }

  // Determine overall status
  const isHealthy =
    dbHealth.status === 'healthy' &&
    redisHealth.status === 'healthy' &&
    meiliHealth.status === 'healthy';

  const isDegraded =
    dbHealth.status === 'healthy' ||
    redisHealth.status === 'healthy' ||
    meiliHealth.status === 'healthy';

  const overallStatus = isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy';

  const responseData = {
    service: 'ThePurple API',
    status: overallStatus,
    version: '1.0.0',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    totalResponseTimeMs: Date.now() - startTime,
    dependencies: {
      database: dbHealth,
      redis: redisHealth,
      bullmq: queueHealth,
      meilisearch: meiliHealth,
    },
  };

  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;
  return ApiResponse.success(res, responseData, `ThePurple API is ${overallStatus}`, httpStatus);
});

export default { getHealth };
