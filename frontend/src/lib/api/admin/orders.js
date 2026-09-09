import { request } from '../client';

export const adminOrdersApi = {
  /**
   * Fetch all orders (admin view).
   */
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/orders${query ? `?${query}` : ''}`);
  },

  /**
   * Fetch a single order by ID (admin view).
   */
  getById: async (orderId) => {
    return request(`/admin/orders/${orderId}`);
  },

  /**
   * Update order status.
   */
  updateStatus: async (orderId, status) => {
    return request(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },
};
