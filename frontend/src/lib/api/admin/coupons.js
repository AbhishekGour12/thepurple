import { request } from '../client';

export const couponsApi = {
  /**
   * List all coupons with filters and pagination
   */
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.type && params.type !== 'all') query.set('type', params.type);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const qs = query.toString();
    return request(`/admin/coupons${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get single coupon details
   */
  get: (id) => request(`/admin/coupons/${id}`),

  /**
   * Create new coupon
   */
  create: (data) =>
    request('/admin/coupons', {
      method: 'POST',
      body: data,
    }),

  /**
   * Update existing coupon
   */
  update: (id, data) =>
    request(`/admin/coupons/${id}`, {
      method: 'PATCH',
      body: data,
    }),

  /**
   * Toggle coupon status (active/inactive)
   */
  updateStatus: (id, isActive) =>
    request(`/admin/coupons/${id}/status`, {
      method: 'PATCH',
      body: { isActive },
    }),

  /**
   * Delete coupon
   */
  delete: (id) =>
    request(`/admin/coupons/${id}`, {
      method: 'DELETE',
    }),
};

export default couponsApi;
