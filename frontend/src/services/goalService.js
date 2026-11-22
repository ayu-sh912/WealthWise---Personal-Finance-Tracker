import api from './api';

export const goalService = {
  getAll: () => api.get('/goals'),
  getOne: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  contribute: (id, data) => api.post(`/goals/${id}/contribute`, data),
  remove: (id) => api.delete(`/goals/${id}`),
};
