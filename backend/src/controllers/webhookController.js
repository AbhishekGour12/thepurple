import logger from '../config/logger.js';
import { shiprocketService } from '../services/shiprocketService.js';
import ApiResponse from '../utils/apiResponse.js';

export const webhookController = {
  /**
   * Handle incoming Webhook from Shiprocket
   * Supports: Verification test pings, tracking status updates, AWB updates, delivery, RTO, cancellation.
   */
  async handleShiprocketWebhook(req, res, next) {
    try {
      // 1. If it's a GET, HEAD, or OPTIONS verification request from Shiprocket
      if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return res.status(200).json({
          success: true,
          message: 'ThePurple Shiprocket Webhook endpoint is active and verified.',
          timestamp: new Date().toISOString(),
        });
      }

      const payload = req.body || {};
      const headers = req.headers || {};

      logger.info('📩 [Shiprocket Webhook] Received webhook event', {
        method: req.method,
        hasBody: Boolean(payload && Object.keys(payload).length > 0),
        headers: {
          'x-api-key': headers['x-api-key'] ? '***' : undefined,
          'x-shiprocket-token': headers['x-shiprocket-token'] ? '***' : undefined,
          'content-type': headers['content-type'],
        },
      });

      // 2. Handle Test Ping / Empty Body verification from Shiprocket dashboard
      if (!payload || (typeof payload === 'object' && Object.keys(payload).length === 0)) {
        return res.status(200).json({
          success: true,
          message: 'Shiprocket Webhook test ping verified successfully.',
        });
      }

      // 3. Security Check (Optional Webhook Token verification)
      const configuredSecret = process.env.SHIPROCKET_WEBHOOK_SECRET || process.env.SHIPROCKET_API_SECRET;
      const incomingSecret =
        headers['x-api-key'] ||
        headers['x-shiprocket-token'] ||
        headers['http_x_api_key'] ||
        req.query?.secret ||
        req.query?.token ||
        payload?.token;

      if (
        configuredSecret &&
        configuredSecret !== 'placeholder' &&
        incomingSecret &&
        incomingSecret !== configuredSecret
      ) {
        logger.warn('🚫 [Shiprocket Webhook] Invalid secret token received in webhook request.');
        return ApiResponse.error(res, 'Unauthorized webhook request', 401);
      }

      // 4. Handle single or batch payloads
      const events = Array.isArray(payload) ? payload : [payload];
      const results = [];

      for (const eventItem of events) {
        if (eventItem && typeof eventItem === 'object' && Object.keys(eventItem).length > 0) {
          const result = await shiprocketService.processTrackingWebhook(eventItem);
          results.push(result);
        }
      }

      const anySuccess = results.some((r) => r.success);
      logger.info(`✅ [Shiprocket Webhook] Processed ${results.length} event(s). Success: ${anySuccess}`);

      return res.status(200).json({
        success: true,
        message: 'Shiprocket webhook processed successfully',
        processedCount: results.length,
        results,
      });
    } catch (error) {
      logger.error(`❌ [Shiprocket Webhook] Error: ${error.message}`, { stack: error.stack });
      // Always return 200 to webhook test runners to prevent blocking retry storms
      return res.status(200).json({
        success: false,
        message: `Webhook received but error occurred: ${error.message}`,
      });
    }
  },

  /**
   * Test / Ping endpoint to verify Webhook URL connectivity from Shiprocket
   */
  async pingShiprocketWebhook(req, res) {
    return res.status(200).json({
      success: true,
      status: 'active',
      service: 'ThePurple Shiprocket Webhook Listener',
      timestamp: new Date().toISOString(),
      instructions: 'Configure this endpoint in Shiprocket Dashboard -> Settings -> API -> Webhooks',
    });
  },
};

export default webhookController;
