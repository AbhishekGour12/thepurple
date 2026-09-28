import { Router } from 'express';
import { webhookController } from '../controllers/webhookController.js';

const router = Router();

// Shiprocket Webhook Endpoint (Accepts POST events & GET/HEAD verification test pings)
router.all('/shiprocket', webhookController.handleShiprocketWebhook);

export default router;
