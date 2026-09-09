import { request } from '../client';

export const adminUserApi = {
  async listAdmins(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.role) query.set('role', params.role);
    if (params.status !== undefined && params.status !== '') query.set('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request(`/admin/admins${qs}`, { method: 'GET', silent: true });
  },

  async getAdmin(id) {
    return await request(`/admin/admins/${id}`, { method: 'GET', silent: true });
  },

  async createAdmin(data) {
    return await request('/admin/admins', {
      method: 'POST',
      body: data,
      silent: false,
    });
  },

  async updateAdmin(id, data) {
    return await request(`/admin/admins/${id}`, {
      method: 'PATCH',
      body: data,
      silent: false,
    });
  },

  async updateAdminStatus(id, isActive) {
    return await request(`/admin/admins/${id}/status`, {
      method: 'PATCH',
      body: { isActive },
      silent: false,
    });
  },

  async resetAdminAccess(id) {
    return await request(`/admin/admins/${id}/reset-access`, {
      method: 'POST',
      silent: false,
    });
  },

  async deleteAdmin(id) {
    return await request(`/admin/admins/${id}`, {
      method: 'DELETE',
      silent: false,
    });
  },
};

export default adminUserApi;
