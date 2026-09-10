import { request } from '../client';

export const adminDashboardApi = {
  async getAnalytics(params = {}) {
    const query = new URLSearchParams();
    if (params.timeRange) query.set('timeRange', params.timeRange);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request(`/admin/dashboard${qs}`, { method: 'GET', silent: true });
  },
};

export default adminDashboardApi;
