import api from './api';

export const reportService = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  getMonthly: () => api.get('/reports/monthly'),
  getCategoryBreakdown: (params) => api.get('/reports/category', { params }),
  getTrends: () => api.get('/reports/trends'),
};
