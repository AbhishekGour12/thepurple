import { Router } from 'express';
import { testSearchWithIntent, setupSearchIndex } from '../controllers/searchTestController.js';
import validate from '../middlewares/validator.js';
import { searchTestQuerySchema } from '../validators/index.js';

const router = Router();

router.get('/test-query', validate(searchTestQuerySchema, 'query'), testSearchWithIntent);
router.post('/init', setupSearchIndex);

export default router;
