import logger from '../config/logger.js';
import { shiprocketService } from '../services/shiprocketService.js';
import ApiResponse from '../utils/apiResponse.js';

export const webhookController = {
  /**
   * Handle incoming Webhook from Shiprocket
   * Supports: Tracking status update, AWB assigned, Out for delivery, Delivered, RTO, Cancelled.
   */
  async handleShiprocketWebhook(req, res, next) {
    try {
      const payload = req.body;
      const headers = req.headers;

      logger.info('📩 [Shiprocket Webhook] Received webhook POST event', {
        headers: {
          'x-api-key': headers['x-api-key'] ? '***' : undefined,
          'x-shiprocket-token': headers['x-shiprocket-token'] ? '***' : undefined,
          'content-type': headers['content-type'],
        },
        payloadSummary: {
          awb: payload?.awb || payload?.awb_code || payload?.data?.awb,
          orderId: payload?.order_id || payload?.channel_order_id || payload?.data?.order_id,
          status: payload?.current_status || payload?.shipment_status || payload?.status || payload?.data?.current_status,
          courier: payload?.courier_name || payload?.courier,
        },
      });

      // 1. Security Check (Optional Webhook Token verification)
      const configuredSecret = process.env.SHIPROCKET_WEBHOOK_SECRET || process.env.SHIPROCKET_API_SECRET;
      const incomingSecret =
        headers['x-api-key'] ||
        headers['x-shiprocket-token'] ||
        headers['http_x_api_key'] ||
        req.query.secret ||
        req.query.token ||
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

      if (!payload || (typeof payload !== 'object' && !Array.isArray(payload))) {
        return ApiResponse.error(res, 'Empty or invalid JSON payload', 400);
      }

      // 2. Handle single or batch payloads
      const events = Array.isArray(payload) ? payload : [payload];
      const results = [];

      for (const eventItem of events) {
        const result = await shiprocketService.processTrackingWebhook(eventItem);
        results.push(result);
      }

      const anySuccess = results.some((r) => r.success);
      logger.info(`✅ [Shiprocket Webhook] Processed ${events.length} event(s). Success: ${anySuccess}`);

      return ApiResponse.success(
        res,
        {
          processedCount: events.length,
          results,
        },
        'Shiprocket webhook processed successfully'
      );
    } catch (error) {
      logger.error(`❌ [Shiprocket Webhook] Failed to process webhook: ${error.message}`, { stack: error.stack });
      return ApiResponse.error(res, `Webhook processing failed: ${error.message}`, 500);
    }
  },

  /**
   * Test / Ping endpoint to verify Webhook URL connectivity from Shiprocket
   */
  async pingShiprocketWebhook(req, res) {
    return ApiResponse.success(res, {
      status: 'active',
      service: 'ThePurple Shiprocket Webhook Listener',
      timestamp: new Date().toISOString(),
      instructions: 'Configure this endpoint in Shiprocket Dashboard -> Settings -> API -> Webhooks',
    }, 'Shiprocket Webhook endpoint is active and listening');
  },
};

export default webhookController;
