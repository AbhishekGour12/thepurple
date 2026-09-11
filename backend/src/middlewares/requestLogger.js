import morgan from 'morgan';
import logger from '../config/logger.js';
import env from '../config/env.js';

// Pipe Morgan output to Winston
const stream = {
  write: (message) => logger.info(message.trim()),
};

export const requestLogger = morgan(
  env.isProduction ? 'combined' : ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);

export default requestLogger;
