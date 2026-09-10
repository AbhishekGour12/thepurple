import { request, getApiUrl } from '../client';

export const adminProductApi = {
  async listProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.subcategoryId) query.set('subcategoryId', params.subcategoryId);
    if (params.status) query.set('status', params.status);
    if (params.stockStatus) query.set('stockStatus', params.stockStatus);
    if (params.minPrice !== undefined && params.minPrice !== '') query.set('minPrice', params.minPrice);
    if (params.maxPrice !== undefined && params.maxPrice !== '') query.set('maxPrice', params.maxPrice);
    if (params.minStock !== undefined && params.minStock !== '') query.set('minStock', params.minStock);
    if (params.maxStock !== undefined && params.maxStock !== '') query.set('maxStock', params.maxStock);
    if (params.minDiscount !== undefined && params.minDiscount !== '') query.set('minDiscount', params.minDiscount);
    if (params.maxDiscount !== undefined && params.maxDiscount !== '') query.set('maxDiscount', params.maxDiscount);
    if (params.brand) query.set('brand', params.brand);
    if (params.isFeatured !== undefined && params.isFeatured !== '') query.set('isFeatured', params.isFeatured);
    if (params.isBestSeller !== undefined && params.isBestSeller !== '') query.set('isBestSeller', params.isBestSeller);
    if (params.isBulk !== undefined && params.isBulk !== '') query.set('isBulk', params.isBulk);
    if (params.tags) query.set('tags', params.tags);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.sort) query.set('sort', params.sort);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request(`/admin/products${qs}`, { method: 'GET', silent: true });
  },

  async getProduct(id) {
    return await request(`/admin/products/${id}`, { method: 'GET', silent: true });
  },

  async createProduct(data) {
    return await request('/admin/products', {
      method: 'POST',
      body: data,
      silent: false,
    });
  },

  async updateProduct(id, data) {
    return await request(`/admin/products/${id}`, {
      method: 'PATCH',
      body: data,
      silent: false,
    });
  },

  async updateProductStatus(id, status) {
    return await request(`/admin/products/${id}/status`, {
      method: 'PATCH',
      body: { status },
      silent: false,
    });
  },

  async deleteProduct(id, silent = true) {
    return await request(`/admin/products/${id}`, {
      method: 'DELETE',
      silent,
    });
  },

  async bulkDeleteProducts(ids = [], silent = true) {
    return await request('/admin/products/bulk', {
      method: 'DELETE',
      body: { ids },
      silent,
    });
  },

  async deleteAllProducts(silent = true) {
    return await request('/admin/products/bulk', {
      method: 'DELETE',
      body: { all: true },
      silent,
    });
  },

  async uploadImage(file, folder = 'products') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    return await request('/admin/upload/image', {
      method: 'POST',
      formData,
      silent: false,
    });
  },

  async uploadMultipleImages(files, folder = 'products') {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    formData.append('folder', folder);

    return await request('/admin/upload/images', {
      method: 'POST',
      formData,
      silent: false,
    });
  },

  async deleteProductImage(productId, imageId, silent = false) {
    return await request(`/admin/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
      silent,
    });
  },

  async deleteStorageImage(keyOrUrl, silent = true) {
    return await request('/admin/upload/image', {
      method: 'DELETE',
      body: { key: keyOrUrl, imageUrl: keyOrUrl },
      silent,
    });
  },
};

export default adminProductApi;
