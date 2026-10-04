import env from '../config/env.js';
import logger from '../config/logger.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Global Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let errors = err.details || null;

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    errorCode = 'FILE_UPLOAD_ERROR';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded file exceeds the maximum allowed size (100MB limit)';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected upload field "${err.field}". Allowed fields are "file" and "images".`;
    } else {
      message = err.message || 'File upload error';
    }
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    errorCode = 'DATABASE_VALIDATION_ERROR';
    message = 'Validation error occurred';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  }

  // Log error (with stack trace internally, but not sent in production HTTP response)
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - ${message}`, {
      statusCode,
      errorCode,
      stack: err.stack,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${message}`, {
      statusCode,
      errorCode,
      errors: err.errors ? err.errors.map(e => ({ field: e.path, message: e.message })) : err.message,
    });
  }

  // In production, ensure no sensitive internal error messages leak
  if (env.isProduction && statusCode === 500) {
    message = 'Something went wrong. Please try again later.';
    errors = null;
  }

  return ApiResponse.error(res, message, statusCode, errorCode, errors);
};

export default errorHandler;
