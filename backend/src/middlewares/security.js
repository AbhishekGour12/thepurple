import helmet from 'helmet';
import cors from 'cors';
import env from '../config/env.js';

export const configureSecurityHeaders = () => {
  return helmet({
    contentSecurityPolicy: env.isProduction ? undefined : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
};

export const configureCors = () => {
  const allowedOrigins = [
    env.FRONTEND_URL,
    'https://thepurple.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin === 'https://thepurple.vercel.app' ||
        origin.endsWith('.vercel.app') ||
        !env.isProduction;

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });
};
