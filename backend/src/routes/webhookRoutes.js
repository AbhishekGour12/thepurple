import { Router } from 'express';
import { webhookController } from '../controllers/webhookController.js';

const router = Router();

// Tracking Webhook Endpoints (Without keywords like 'shiprocket', 'sr', 'kr', 'kartrocket')
router.all('/tracking', webhookController.handleShiprocketWebhook);
router.all('/delivery', webhookController.handleShiprocketWebhook);
router.all('/courier', webhookController.handleShiprocketWebhook);
router.all('/order-updates', webhookController.handleShiprocketWebhook);
router.all('/shiprocket', webhookController.handleShiprocketWebhook);

export default router;
