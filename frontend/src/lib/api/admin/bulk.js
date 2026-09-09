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

  async validateBulkFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return await request('/admin/products/bulk/validate', {
      method: 'POST',
      formData,
      silent: false,
    });
  },

  async executeBulkImport(file) {
    const formData = new FormData();
    formData.append('file', file);

    return await request('/admin/products/bulk/import', {
      method: 'POST',
      formData,
      silent: false,
    });
  },

  async getImportJobStatus(jobId) {
    return await request(`/admin/products/bulk/jobs/${jobId}`, {
      method: 'GET',
      silent: true,
    });
  },

  async listImportHistory() {
    return await request('/admin/products/bulk/history', {
      method: 'GET',
      silent: true,
    });
  },
};

export default adminBulkApi;
