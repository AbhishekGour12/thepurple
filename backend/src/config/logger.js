import winston from 'winston';
import env from './env.js';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}]: ${stack || message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    env.isProduction ? json() : customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: env.isProduction
        ? json()
        : combine(
            colorize({ all: true }),
            timestamp({ format: 'HH:mm:ss' }),
            customFormat
          ),
    }),
  ],
});

export default logger;
