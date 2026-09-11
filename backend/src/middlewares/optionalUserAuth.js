import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';

export const optionalUserAuth = asyncHandler(async (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.id && decoded.type === 'customer') {
      const user = await User.findByPk(decoded.id);
      if (user && user.status !== 'BLOCKED') {
        req.user = user;
        req.userToken = token;
      }
    }
  } catch {
    // If token invalid/expired, continue as guest
  }

  next();
});

export default optionalUserAuth;
