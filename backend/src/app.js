import express from 'express';
import { configureSecurityHeaders, configureCors } from './middlewares/security.js';
import requestLogger from './middlewares/requestLogger.js';
import errorHandler from './middlewares/errorHandler.js';
import apiV1Router from './routes/index.js';
import AppError from './utils/customError.js';
import ApiResponse from './utils/apiResponse.js';

export const createApp = () => {
  const app = express();

  // Basic Security & Headers
  app.use(configureSecurityHeaders());
  app.use(configureCors());

  // Request Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request Logger
  app.use(requestLogger);

  // Root endpoint info
  app.get('/', (req, res) => {
    return ApiResponse.success(res, {
      name: 'ThePurple E-Commerce API',
      version: '1.0.0',
      docs: '/api/v1/health',
    }, 'ThePurple API Service');
  });

  // Mount API Version 1
  app.use('/api/v1', apiV1Router);

  // Handle 404
  app.all('*', (req, res, next) => {
    next(AppError.notFound(`Cannot find ${req.method} ${req.originalUrl} on this server`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp;
