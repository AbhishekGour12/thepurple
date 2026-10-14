import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  getAvailableCoupons,
  mergeCart,
} from '../controllers/cartController.js';
import { authenticateOptionalUser } from '../user/middlewares/authenticateUser.js';
import publicSettingController from '../controllers/settingController.js';

const router = Router();

// Public min-cart setting
router.get('/min-cart', publicSettingController.getMinCartSetting);

// Optional authentication: extracts req.user if customer token is provided
router.use(authenticateOptionalUser);

router.get('/', getCart);
router.get('/available-coupons', getAvailableCoupons);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.post('/clear', clearCart);
router.post('/apply-coupon', applyCoupon);
router.post('/merge', mergeCart);

export default router;
