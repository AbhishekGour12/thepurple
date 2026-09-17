import { request } from '../client';

export const adminPaymentsApi = {
  /**
   * Fetch all payments with filters and pagination.
   */
  getAll: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/admin/payments${query ? `?${query}` : ''}`);
  },

  /**
   * Fetch payment aggregate metrics / statistics.
   */
  getStats: async () => {
    return request('/admin/payments/stats');
  },

  /**
   * Fetch a single payment by ID.
   */
  getById: async (paymentId) => {
    return request(`/admin/payments/${paymentId}`);
  },

  /**
   * Export payments dataset.
   */
  exportData: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/admin/payments/export${query ? `?${query}` : ''}`);
  },
};

export default adminPaymentsApi;
