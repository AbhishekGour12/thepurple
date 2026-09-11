import { request } from '../client';
import { setAdminSession, signOutAdmin } from '../../auth/session';

export const adminAuthApi = {
  async login(email, password) {
    const data = await request('/admin/auth/login', {
      method: 'POST',
      body: { email, password },
      silent: false,
    });
    if (data?.token && data?.admin) {
      setAdminSession(data.token, data.admin);
    }
    return data;
  },

  async forgotPassword(email) {
    return await request('/admin/auth/forgot-password', {
      method: 'POST',
      body: { email },
      silent: false,
    });
  },

  async resetPassword(token, newPassword, confirmPassword) {
    return await request('/admin/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword, confirmPassword },
      silent: false,
    });
  },

  async changePassword(currentPassword, newPassword, confirmPassword) {
    return await request('/admin/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword, confirmPassword },
      silent: false,
    });
  },

  async me() {
    return await request('/admin/auth/me', {
      method: 'GET',
      silent: true,
    });
  },

  async logout() {
    try {
      await request('/admin/auth/logout', { method: 'POST', silent: true });
    } finally {
      await signOutAdmin();
    }
  },
};

export default adminAuthApi;
