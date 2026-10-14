import { request } from '../client';

export const settingsApi = {
  /**
   * Get Minimum Cart Value configuration
   */
  getMinCart: () => request('/admin/settings/min-cart'),

  /**
   * Update Minimum Cart Value configuration
   * @param {Object} data { enabled, minCartValue, presets, message }
   */
  updateMinCart: (data) =>
    request('/admin/settings/min-cart', {
      method: 'PUT',
      body: data,
    }),

  /**
   * Reset / Disable Minimum Cart Value requirement
   */
  deleteMinCart: () =>
    request('/admin/settings/min-cart', {
      method: 'DELETE',
    }),

  /**
   * Add a new preset value
   */
  addPreset: (amount) =>
    request('/admin/settings/min-cart/presets', {
      method: 'POST',
      body: { amount },
    }),

  /**
   * Remove an existing preset value
   */
  removePreset: (amount) =>
    request(`/admin/settings/min-cart/presets/${amount}`, {
      method: 'DELETE',
    }),
};

export default settingsApi;
