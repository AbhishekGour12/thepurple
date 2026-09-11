import { request } from '../client';

export const adminCategoryApi = {
  // Categories
  async listCategories(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.isActive !== undefined) query.set('isActive', params.isActive);
    if (params.isFeatured !== undefined) query.set('isFeatured', params.isFeatured);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request(`/admin/categories${qs}`, { method: 'GET', silent: true });
  },

  async createCategory(data) {
    return await request('/admin/categories', {
      method: 'POST',
      body: data,
      silent: false,
    });
  },

  async bulkCreateCategories(data) {
    return await request('/admin/categories/bulk', {
      method: 'POST',
      body: data,
      silent: false,
    });
  },

  async updateCategory(id, data) {
    return await request(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: data,
      silent: false,
    });
  },

  async deleteCategory(id, silent = true) {
    return await request(`/admin/categories/${id}`, {
      method: 'DELETE',
      silent,
    });
  },

  async bulkDeleteCategories(ids = [], silent = true) {
    return await request('/admin/categories/bulk', {
      method: 'DELETE',
      body: { ids },
      silent,
    });
  },

  async deleteAllCategories(silent = true) {
    return await request('/admin/categories/bulk', {
      method: 'DELETE',
      body: { all: true },
      silent,
    });
  },

  // Subcategories
  async listSubcategories(params = {}) {
    const query = new URLSearchParams();
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.search) query.set('search', params.search);
    if (params.isActive !== undefined) query.set('isActive', params.isActive);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request(`/admin/subcategories${qs}`, { method: 'GET', silent: true });
  },

  async createSubcategory(data, silent = true) {
    return await request('/admin/subcategories', {
      method: 'POST',
      body: data,
      silent,
    });
  },

  async updateSubcategory(id, data, silent = true) {
    return await request(`/admin/subcategories/${id}`, {
      method: 'PATCH',
      body: data,
      silent,
    });
  },

  async deleteSubcategory(id, silent = true) {
    return await request(`/admin/subcategories/${id}`, {
      method: 'DELETE',
      silent,
    });
  },

  async bulkDeleteSubcategories(ids = [], silent = true) {
    return await request('/admin/subcategories/bulk', {
      method: 'DELETE',
      body: { ids },
      silent,
    });
  },

  async deleteAllSubcategories(silent = true) {
    return await request('/admin/subcategories/bulk', {
      method: 'DELETE',
      body: { all: true },
      silent,
    });
  },
};

export default adminCategoryApi;
