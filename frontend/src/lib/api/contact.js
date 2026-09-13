import { request } from './client';

export const contactApi = {
  /**
   * Submit contact form query
   */
  async submitContact(formData) {
    return request('/contact', {
      method: 'POST',
      body: formData,
      silent: true,
    });
  },
};

export default contactApi;
