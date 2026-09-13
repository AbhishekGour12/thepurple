import { Router } from 'express';
import contactController from '../controllers/contactController.js';

const router = Router();

// Public endpoint to submit contact form
router.post('/', contactController.submitContact);

export default router;
