import { Router } from 'express';
import orderController from '../controllers/orderController.js';
import webhookController from '../controllers/webhookController.js';
import { authenticateUser, authenticateOptionalUser } from '../user/middlewares/authenticateUser.js';

const router = Router();

// Webhook Aliases
router.all('/webhook/tracking', webhookController.handleShiprocketWebhook);
router.all('/webhook/shiprocket', webhookController.handleShiprocketWebhook);

// 1. Dynamic Shipping Calculation (Public)
router.post('/calculate-shipping', orderController.calculateShipping);

// 2. Create Razorpay Payment Intent (Public / Guest / Auth)
router.post('/create-payment-intent', orderController.createPaymentIntent);

// 3. Verify Payment & Create Order (Optional auth, guest supported)
router.post(
  '/verify-payment',
  authenticateOptionalUser,
  orderController.verifyPaymentAndCreateOrder
);

// 4. Customer: Get My Orders (Optional auth - matches by user, email, mobile, or order numbers)
router.get('/my-orders', authenticateOptionalUser, orderController.getMyOrders);

// 5. Public Live Tracking by Order Number
router.get('/track', orderController.trackOrder);

// 6. Get Single Order Details (Protected or by Order Number)
router.get('/:id', orderController.getOrderDetails);

// 7. Sync Live Shiprocket Tracking Status for Order
router.post('/:id/sync-shiprocket', orderController.syncShiprocketStatus);

// 8. Cancel Order
router.post('/:id/cancel', orderController.cancelOrder);

// 9. Request Refund
router.post('/:id/request-refund', orderController.requestRefund);

export default router;
