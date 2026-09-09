import { Worker } from 'bullmq';
import { QUEUE_NAMES, getQueueConnection } from '../config/queues.js';
import bulkImportService from './bulkImportService.js';
import logger from '../config/logger.js';

class WorkerService {
  constructor() {
    this.workers = new Map();
    this.connection = getQueueConnection();
  }

  /**
   * Initializes workers for background queues
   */
  initWorkers() {
    this.initTestWorker();
    this.initBulkImportWorker();
  }

  /**
   * Worker for test queue verification
   */
  initTestWorker() {
    if (this.workers.has(QUEUE_NAMES.TEST_QUEUE)) return;

    try {
      const worker = new Worker(
        QUEUE_NAMES.TEST_QUEUE,
        async (job) => {
          logger.info(`BullMQ Worker started processing job [${job.name}] #${job.id}`, { data: job.data });
          await new Promise((resolve) => setTimeout(resolve, 300));
          const result = {
            processedAt: new Date().toISOString(),
            status: 'COMPLETED_SUCCESSFULLY',
            jobId: job.id,
            jobName: job.name,
          };
          logger.info(`BullMQ Worker finished job [${job.name}] #${job.id}`);
          return result;
        },
        {
          connection: this.connection,
          concurrency: 5,
        }
      );

      this.workers.set(QUEUE_NAMES.TEST_QUEUE, worker);
      logger.info(`BullMQ Worker initialized for queue: ${QUEUE_NAMES.TEST_QUEUE}`);
    } catch (err) {
      logger.warn(`Could not start BullMQ test worker: ${err.message}`);
    }
  }

  /**
   * Worker for processing Bulk Product Imports in background
   */
  initBulkImportWorker() {
    if (this.workers.has(QUEUE_NAMES.BULK_IMPORT)) return;

    try {
      const worker = new Worker(
        QUEUE_NAMES.BULK_IMPORT,
        async (job) => {
          const { validRows, bulkImportId, adminId } = job.data;
          logger.info(`BullMQ Bulk Import Job started for ${validRows?.length} products (Import ID: ${bulkImportId})`);

          const result = await bulkImportService.processImportBatch(validRows, bulkImportId, adminId);
          logger.info(`BullMQ Bulk Import Job completed (Import ID: ${bulkImportId}): Created=${result.createdCount}, Failed=${result.failedCount}`);
          return result;
        },
        {
          connection: this.connection,
          concurrency: 2,
        }
      );

      worker.on('completed', (job, returnvalue) => {
        logger.info(`BullMQ Bulk Import Job #${job.id} finished`, { returnvalue });
      });

      worker.on('failed', (job, err) => {
        logger.error(`BullMQ Bulk Import Job #${job?.id} failed: ${err.message}`);
      });

      this.workers.set(QUEUE_NAMES.BULK_IMPORT, worker);
      logger.info(`BullMQ Worker initialized for queue: ${QUEUE_NAMES.BULK_IMPORT}`);
    } catch (err) {
      logger.warn(`Could not start BullMQ bulk import worker: ${err.message}`);
    }
  }

  async closeAll() {
    for (const [name, worker] of this.workers.entries()) {
      await worker.close();
    }
    this.workers.clear();
  }
}

export const workerService = new WorkerService();
export default workerService;
