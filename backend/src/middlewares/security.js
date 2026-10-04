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
  ].filter(Boolean);

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      const isAllowed =
        !env.isProduction ||
        allowedOrigins.includes(origin) ||
        origin === 'https://thepurple.vercel.app' ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1');

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'x-session-id',
      'x-guest-id',
      'X-Session-Id',
      'X-Guest-Id',
      'Cache-Control',
      'Accept-Language',
    ],
    exposedHeaders: ['Content-Disposition', 'Content-Length'],
    maxAge: 86400,
  });
};
