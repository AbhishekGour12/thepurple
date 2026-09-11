import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for sensitive admin auth endpoints (login, forgot-password, reset-password).
 * Max 10 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    statusCode: 429,
  },
});

export default authRateLimiter;
