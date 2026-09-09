import { queueService } from '../services/queueService.js';
import { QUEUE_NAMES } from '../config/queues.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const dispatchTestJob = asyncHandler(async (req, res) => {
  const { jobName = 'system-test-job', data = {}, priority, delayMs } = req.body || {};

  const job = await queueService.addJob(
    QUEUE_NAMES.TEST_QUEUE,
    jobName,
    {
      source: 'api_test_dispatch',
      dispatchedAt: new Date().toISOString(),
      ...data,
    },
    {
      priority,
      delay: delayMs,
    }
  );

  return ApiResponse.success(
    res,
    {
      jobId: job.id,
      name: job.name,
      queue: QUEUE_NAMES.TEST_QUEUE,
      status: 'QUEUED',
      timestamp: new Date().toISOString(),
    },
    'Test job added to BullMQ successfully',
    201
  );
});

export const getQueueStatus = asyncHandler(async (req, res) => {
  const metrics = await queueService.getQueueMetrics(QUEUE_NAMES.TEST_QUEUE);
  return ApiResponse.success(res, { queue: QUEUE_NAMES.TEST_QUEUE, metrics }, 'Queue metrics retrieved');
});

export default { dispatchTestJob, getQueueStatus };
