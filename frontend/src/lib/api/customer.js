import { request } from './client';
import { getStoredCustomerToken } from '@/lib/auth/session';

export const customerApi = {
  /**
   * Login with Google ID token.
   */
  loginWithGoogle: (idToken) =>
    request('/user/auth/google', {
      method: 'POST',
      body: { idToken },
      token: null,
      silent: true,
    }),

  /**
   * Login with email and password.
   */
  login: (email, password) =>
    request('/user/auth/login', {
      method: 'POST',
      body: { email, password },
      token: null,
    }),

  /**
   * Register a new customer.
   */
  register: (data) =>
    request('/user/auth/register', {
      method: 'POST',
      body: data,
      token: null,
    }),

  /**
   * Get authenticated user profile.
   */
  me: async ({ silent = false } = {}) => {
    const token = getStoredCustomerToken();
    return request('/user/me', { token, silent });
  },

  /**
   * Update authenticated user profile.
   */
  updateMe: async (body) => {
    const token = getStoredCustomerToken();
    return request('/user/me', { method: 'PATCH', body, token });
  },
};
