import { request } from '../client';

export const adminAttributeApi = {
  // Colors
  async listColors() {
    return await request('/admin/colors', { method: 'GET', silent: true });
  },

  async createColor(data, silent = true) {
    return await request('/admin/colors', { method: 'POST', body: data, silent });
  },

  async bulkCreateColors(data, silent = true) {
    return await request('/admin/colors/bulk', { method: 'POST', body: data, silent });
  },

  async updateColor(id, data, silent = true) {
    return await request(`/admin/colors/${id}`, { method: 'PATCH', body: data, silent });
  },

  async deleteColor(id, silent = true) {
    return await request(`/admin/colors/${id}`, { method: 'DELETE', silent });
  },

  async bulkDeleteColors(ids = [], silent = true) {
    return await request('/admin/colors/bulk', { method: 'DELETE', body: { ids }, silent });
  },

  async deleteAllColors(silent = true) {
    return await request('/admin/colors/bulk', { method: 'DELETE', body: { all: true }, silent });
  },

  // Sizes
  async listSizes() {
    return await request('/admin/sizes', { method: 'GET', silent: true });
  },

  async createSize(data, silent = true) {
    return await request('/admin/sizes', { method: 'POST', body: data, silent });
  },

  async bulkCreateSizes(data, silent = true) {
    return await request('/admin/sizes/bulk', { method: 'POST', body: data, silent });
  },

  async updateSize(id, data, silent = true) {
    return await request(`/admin/sizes/${id}`, { method: 'PATCH', body: data, silent });
  },

  async deleteSize(id, silent = true) {
    return await request(`/admin/sizes/${id}`, { method: 'DELETE', silent });
  },

  async bulkDeleteSizes(ids = [], silent = true) {
    return await request('/admin/sizes/bulk', { method: 'DELETE', body: { ids }, silent });
  },

  async deleteAllSizes(silent = true) {
    return await request('/admin/sizes/bulk', { method: 'DELETE', body: { all: true }, silent });
  },

  // Dynamic Attributes
  async listAttributes() {
    return await request('/admin/attributes', { method: 'GET', silent: true });
  },

  async createAttribute(data, silent = true) {
    return await request('/admin/attributes', { method: 'POST', body: data, silent });
  },

  async deleteAttribute(id, silent = true) {
    return await request(`/admin/attributes/${id}`, { method: 'DELETE', silent });
  },

  async bulkDeleteAttributes(ids = [], silent = true) {
    return await request('/admin/attributes/bulk', { method: 'DELETE', body: { ids }, silent });
  },

  async deleteAllAttributes(silent = true) {
    return await request('/admin/attributes/bulk', { method: 'DELETE', body: { all: true }, silent });
  },

  async addAttributeValue(attributeId, data, silent = true) {
    return await request(`/admin/attributes/${attributeId}/values`, { method: 'POST', body: data, silent });
  },

  async deleteAttributeValue(attributeId, valueId, silent = true) {
    return await request(`/admin/attributes/${attributeId}/values/${valueId}`, { method: 'DELETE', silent });
  },
};

export default adminAttributeApi;
