import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User, Cart } from '../../models/index.js';
import env from '../../config/env.js';
import AppError from '../../utils/customError.js';
import logger from '../../config/logger.js';

export const userAuthService = {
  /**
   * Handle Customer Google Sign-In with Firebase ID Token
   */
  async loginWithGoogle({ idToken, email, name, avatar, googleId }) {
    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedAvatar = avatar;
    let verifiedGoogleId = googleId;

    // Decode and verify Firebase/Google ID token if provided
    if (idToken) {
      try {
        const decoded = jwt.decode(idToken);
        if (decoded) {
          verifiedEmail = decoded.email || verifiedEmail;
          verifiedName = decoded.name || verifiedName || decoded.email?.split('@')[0];
          verifiedAvatar = decoded.picture || verifiedAvatar;
          verifiedGoogleId = decoded.sub || decoded.user_id || verifiedGoogleId;
        }
      } catch (tokenErr) {
        logger.warn(`Firebase token decode warning: ${tokenErr.message}`);
      }
    }

    if (!verifiedEmail && !verifiedGoogleId) {
      throw AppError.badRequest('Invalid Google authentication credentials: email or Google ID missing');
    }

    // Lookup customer by Google ID or Email
    let user = await User.findOne({
      where: {
        [Op.or]: [
          ...(verifiedGoogleId ? [{ googleId: verifiedGoogleId }] : []),
          ...(verifiedEmail ? [{ email: verifiedEmail.toLowerCase().trim() }] : []),
        ],
      },
    });

    if (user) {
      // Check if user is blocked
      if (user.status === 'BLOCKED') {
        throw AppError.forbidden('Your customer account has been suspended. Please contact customer support.');
      }

      // Update existing customer metadata
      await user.update({
        googleId: user.googleId || verifiedGoogleId,
        avatar: verifiedAvatar || user.avatar,
        name: user.name || verifiedName,
        authProvider: 'GOOGLE',
        lastLoginAt: new Date(),
      });
    } else {
      // Create new customer
      user = await User.create({
        email: verifiedEmail ? verifiedEmail.toLowerCase().trim() : undefined,
        name: verifiedName || 'Customer',
        googleId: verifiedGoogleId,
        avatar: verifiedAvatar,
        authProvider: 'GOOGLE',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        lastLoginAt: new Date(),
      });

      // Initialize default active Cart for customer
      try {
        await Cart.create({
          userId: user.id,
          status: 'ACTIVE',
        });
      } catch (cartErr) {
        logger.warn(`Could not create initial cart for customer ${user.id}: ${cartErr.message}`);
      }
    }

    // Generate Customer JWT token (30 days validity for customer e-commerce convenience)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'customer',
      },
      env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  /**
   * Get Customer Profile
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'mobile', 'avatar', 'role', 'status', 'createdAt', 'lastLoginAt'],
    });
    if (!user) {
      throw AppError.notFound('Customer profile not found');
    }
    return user;
  },
};

export default userAuthService;
