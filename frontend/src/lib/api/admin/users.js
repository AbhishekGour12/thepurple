import { request } from '../client';

export const adminUserApi = {
  async listUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.authProvider) query.set('authProvider', params.authProvider);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request(`/admin/users${qs}`, { method: 'GET', silent: true });
  },

  async getUser(id) {
    return await request(`/admin/users/${id}`, { method: 'GET', silent: true });
  },

  async updateUserStatus(id, status) {
    return await request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: { status },
      silent: false,
    });
  },
};

export default adminUserApi;
