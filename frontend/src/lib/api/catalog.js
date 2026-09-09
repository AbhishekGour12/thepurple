import { request } from './client';

export const catalogApi = {
  /**
   * Fetch all categories.
   */
  getCategories: async (params = {}) => {
    try {
      const query = new URLSearchParams({ limit: '50', ...params }).toString();
      const data = await request(`/categories?${query}`, { silent: true });
      return data?.categories || data || [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch products with optional filters.
   */
  getProducts: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const data = await request(`/products${query ? `?${query}` : ''}`, { silent: true });
      return data || { products: [], pagination: {} };
    } catch {
      return { products: [], pagination: {} };
    }
  },

  /**
   * Fetch a single product by slug.
   */
  getProduct: async (slug) => {
    try {
      const data = await request(`/products/${slug}`, { silent: true });
      return data?.product || data || null;
    } catch {
      return null;
    }
  },
};
