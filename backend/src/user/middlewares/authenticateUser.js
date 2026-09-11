import jwt from 'jsonwebtoken';
import { User } from '../../models/index.js';
import env from '../../config/env.js';
import AppError from '../../utils/customError.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const authenticateUser = asyncHandler(async (req, res, next) => {
  let token = null;

  // Extract from Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(AppError.unauthorized('Authentication required. Please sign in with your Google account.'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded.id || decoded.type !== 'customer') {
      return next(AppError.unauthorized('Invalid customer authentication token.'));
    }

    // Verify user exists and is active
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return next(AppError.unauthorized('Customer account not found.'));
    }

    if (user.status === 'BLOCKED') {
      return next(AppError.forbidden('Your customer account has been suspended. Please contact customer support.'));
    }

    req.user = user;
    req.userToken = token;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Your session has expired. Please sign in again.'));
    }
    return next(AppError.unauthorized('Authentication failed. Invalid session.'));
  }
});

export default authenticateUser;
