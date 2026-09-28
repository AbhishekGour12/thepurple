import { Router } from 'express';
import { webhookController } from '../controllers/webhookController.js';

const router = Router();

// Shiprocket Webhook Endpoint (POST from Shiprocket)
router.post('/shiprocket', webhookController.handleShiprocketWebhook);

// Ping / Verification endpoint (GET to easily verify in browser/monitoring)
router.get('/shiprocket', webhookController.pingShiprocketWebhook);

export default router;
