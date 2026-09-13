import { request } from '../client';

export const adminContactApi = {
  /**
   * List contact queries with filtering and pagination
   */
  async listQueries(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.subject) query.append('subject', params.subject);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    return request(`/admin/contacts${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get single inquiry details
   */
  async getQuery(id) {
    return request(`/admin/contacts/${id}`);
  },

  /**
   * Reply to inquiry (sends customer email and updates status to REPLIED)
   */
  async replyToQuery(id, { replyMessage, adminNotes, status = 'REPLIED' }) {
    return request(`/admin/contacts/${id}/reply`, {
      method: 'POST',
      body: { replyMessage, adminNotes, status },
    });
  },

  /**
   * Update inquiry status and internal notes without emailing
   */
  async updateStatus(id, { status, adminNotes }) {
    return request(`/admin/contacts/${id}/status`, {
      method: 'PATCH',
      body: { status, adminNotes },
    });
  },

  /**
   * Delete an inquiry
   */
  async deleteQuery(id) {
    return request(`/admin/contacts/${id}`, {
      method: 'DELETE',
    });
  },
};

export default adminContactApi;
