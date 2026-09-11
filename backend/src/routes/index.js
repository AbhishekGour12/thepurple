import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import queueRoutes from './queueRoutes.js';
import searchRoutes from './searchRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import interestRoutes from './interestRoutes.js';
import adminRoutes from '../admin/routes/adminRoutes.js';
import userRoutes from '../user/routes/userRoutes.js';

const apiV1Router = Router();

// Infrastructure routes
apiV1Router.use('/health', healthRoutes);
apiV1Router.use('/queues', queueRoutes);
apiV1Router.use('/search', searchRoutes);

// Public / Storefront routes
apiV1Router.use('/categories', categoryRoutes);
apiV1Router.use('/products', productRoutes);
apiV1Router.use('/banners', bannerRoutes);
apiV1Router.use('/interests', interestRoutes);

// Role-based routes
apiV1Router.use('/admin', adminRoutes);
apiV1Router.use('/user', userRoutes);

export default apiV1Router;
