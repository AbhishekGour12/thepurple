import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import queueRoutes from './queueRoutes.js';
import searchRoutes from './searchRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import interestRoutes from './interestRoutes.js';
import contactRoutes from './contactRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import webhookRoutes from './webhookRoutes.js';
import adminRoutes from '../admin/routes/adminRoutes.js';
import userRoutes from '../user/routes/userRoutes.js';

const apiV1Router = Router();

// Infrastructure routes
apiV1Router.use('/health', healthRoutes);
apiV1Router.use('/queues', queueRoutes);
apiV1Router.use('/search', searchRoutes);
apiV1Router.use('/webhooks', webhookRoutes);

// Public / Storefront routes
apiV1Router.use('/categories', categoryRoutes);
apiV1Router.use('/products', productRoutes);
apiV1Router.use('/banners', bannerRoutes);
apiV1Router.use('/interests', interestRoutes);
apiV1Router.use('/contact', contactRoutes);
apiV1Router.use('/cart', cartRoutes);
apiV1Router.use('/orders', orderRoutes);
apiV1Router.use('/reviews', reviewRoutes);

// Role-based routes
apiV1Router.use('/admin', adminRoutes);
apiV1Router.use('/user', userRoutes);

export default apiV1Router;
