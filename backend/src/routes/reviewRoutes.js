import { Router } from 'express';
import reviewController from '../controllers/reviewController.js';
import { authenticateUser } from '../user/middlewares/authenticateUser.js';

const router = Router();

// 1. Get all reviews and rating stats for a product
router.get('/product/:productIdOrSlug', reviewController.getProductReviews);

// 2. Submit a review (Login required)
router.post('/', authenticateUser, reviewController.createReview);

// 3. Upvote review as helpful
router.post('/:id/helpful', reviewController.markHelpful);

export default router;
