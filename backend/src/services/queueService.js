import { Queue } from 'bullmq';
import { QUEUE_NAMES, defaultJobOptions, getQueueConnection } from '../config/queues.js';
import logger from '../config/logger.js';

class QueueService {
  constructor() {
    this.queues = new Map();
    this.connection = getQueueConnection();
  }

  getQueue(queueName) {
    if (!this.queues.has(queueName)) {
      try {
        const queue = new Queue(queueName, {
          connection: this.connection,
          defaultJobOptions,
        });
        queue.on('error', (err) => {
          logger.warn(`BullMQ Queue [${queueName}] error: ${err.message}`);
        });
        this.queues.set(queueName, queue);
      } catch (err) {
        logger.error(`Failed to initialize queue [${queueName}]: ${err.message}`);
        throw err;
      }
    }
    return this.queues.get(queueName);
  }

  async addJob(queueName, jobName, data = {}, options = {}) {
    try {
      const queue = this.getQueue(queueName);
      const job = await queue.add(jobName, data, {
        ...defaultJobOptions,
        ...options,
      });
      logger.info(`BullMQ Job queued [${job.name}] with id: ${job.id} in queue: ${queueName}`);
      return job;
    } catch (err) {
      logger.error(`Failed to add job to queue ${queueName}: ${err.message}`);
      throw err;
    }
  }

  async addTestJob(data = {}) {
    return await this.addJob(QUEUE_NAMES.TEST_QUEUE, 'system-test-job', {
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  async getQueueMetrics(queueName) {
    try {
      const queue = this.getQueue(queueName);
      const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
      return counts;
    } catch (err) {
      return { error: err.message };
    }
  }

  async closeAll() {
    for (const [name, queue] of this.queues.entries()) {
      await queue.close();
    }
    this.queues.clear();
  }
}

export const queueService = new QueueService();
export default queueService;
