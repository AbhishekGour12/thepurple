import { request } from '../client';

export const adminBannerApi = {
  async listBanners(params = {}) {
    const query = new URLSearchParams();
    if (params.placement) query.set('placement', params.placement);
    if (params.bannerType) query.set('bannerType', params.bannerType);
    if (params.isActive !== undefined && params.isActive !== '') query.set('isActive', params.isActive);
    if (params.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request(`/admin/banners${qs}`, { method: 'GET', silent: true });
  },

  async getBanner(id) {
    return await request(`/admin/banners/${id}`, { method: 'GET', silent: true });
  },

  async createBanner(data) {
    return await request('/admin/banners', {
      method: 'POST',
      body: data,
      silent: false,
    });
  },

  async updateBanner(id, data) {
    return await request(`/admin/banners/${id}`, {
      method: 'PATCH',
      body: data,
      silent: false,
    });
  },

  async updateBannerStatus(id, isActive) {
    return await request(`/admin/banners/${id}/status`, {
      method: 'PATCH',
      body: { isActive },
      silent: false,
    });
  },

  async reorderBanners(items) {
    return await request('/admin/banners/reorder', {
      method: 'PATCH',
      body: { items },
      silent: false,
    });
  },

  async deleteBanner(id, silent = false) {
    return await request(`/admin/banners/${id}`, {
      method: 'DELETE',
      silent,
    });
  },

  async uploadBannerImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'banners');

    return await request('/admin/upload/image', {
      method: 'POST',
      formData,
      silent: false,
    });
  },
};

export default adminBannerApi;
