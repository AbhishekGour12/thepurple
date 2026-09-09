import apiClient from './apiClient.js';
import { API_ENDPOINTS } from '../constants/index.js';

export const healthService = {
  async getHealth() {
    return await apiClient.get(API_ENDPOINTS.HEALTH);
  },

  async dispatchTestJob(jobName = 'frontend-test-job', data = {}) {
    return await apiClient.post(API_ENDPOINTS.QUEUES.TEST_JOB, { jobName, data });
  },

  async testSearchQuery(q = 'gold chain') {
    return await apiClient.get(`${API_ENDPOINTS.SEARCH.TEST_QUERY}?q=${encodeURIComponent(q)}`);
  },
};

export default healthService;
