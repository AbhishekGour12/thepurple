import { Router } from 'express';
import { dispatchTestJob, getQueueStatus } from '../controllers/queueTestController.js';
import validate from '../middlewares/validator.js';
import { queueTestJobSchema } from '../validators/index.js';

const router = Router();

router.post('/test-job', validate(queueTestJobSchema, 'body'), dispatchTestJob);
router.get('/status', getQueueStatus);

export default router;
