import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import queueRoutes from './queueRoutes.js';
import searchRoutes from './searchRoutes.js';
import adminRoutes from '../admin/routes/adminRoutes.js';
import userRoutes from '../user/routes/userRoutes.js';

const apiV1Router = Router();

// Infrastructure routes
apiV1Router.use('/health', healthRoutes);
apiV1Router.use('/queues', queueRoutes);
apiV1Router.use('/search', searchRoutes);

// Role-based routes
apiV1Router.use('/admin', adminRoutes);
apiV1Router.use('/user', userRoutes);

export default apiV1Router;
