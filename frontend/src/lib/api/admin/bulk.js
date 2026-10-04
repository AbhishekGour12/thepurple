import { request, getApiUrl } from '../client';
import { getStoredAdminToken } from '../../auth/session';

export const adminBulkApi = {
  getTemplateUrl() {
    return `${getApiUrl()}/admin/products/bulk/template`;
  },

  async downloadTemplate() {
    const token = getStoredAdminToken();
    const res = await fetch(this.getTemplateUrl(), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to download template');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ThePurple_Product_Import_Template.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  async validateBulkFile(file, images = []) {
    const token = getStoredAdminToken();
    const formData = new FormData();
    formData.append('file', file);
    if (images && images.length > 0) {
      Array.from(images).forEach((img) => formData.append('images', img));
    }

    return await request('/admin/products/bulk/validate', {
      method: 'POST',
      formData,
      token,
      silent: false,
    });
  },

  async executeBulkImport(file, images = []) {
    const token = getStoredAdminToken();
    const formData = new FormData();
    formData.append('file', file);
    if (images && images.length > 0) {
      Array.from(images).forEach((img) => formData.append('images', img));
    }

    return await request('/admin/products/bulk/import', {
      method: 'POST',
      formData,
      token,
      silent: false,
    });
  },

  async getImportJobStatus(jobId) {
    const token = getStoredAdminToken();
    return await request(`/admin/products/bulk/jobs/${jobId}`, {
      method: 'GET',
      token,
      silent: true,
    });
  },

  async listImportHistory() {
    const token = getStoredAdminToken();
    return await request('/admin/products/bulk/history', {
      method: 'GET',
      token,
      silent: true,
    });
  },
};

export default adminBulkApi;
