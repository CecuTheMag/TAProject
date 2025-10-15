import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.get('/auth/logout'),
};

export const equipment = {
  getAll: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
};

export const requests = {
  create: (data) => api.post('/request', data),
  getUserRequests: () => api.get('/request'),
  getAllRequests: () => api.get('/request/manager'),
  approve: (id) => api.put(`/request/${id}/approve`),
  reject: (id) => api.put(`/request/${id}/reject`),
  return: (id, data) => api.put(`/request/${id}/return`, data),
};

export const dashboard = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
  getAlerts: () => api.get('/dashboard/alerts'),
};

export const alerts = {
  getLowStock: () => api.get('/alerts/low-stock'),
  getOverdue: () => api.get('/alerts/overdue'),
  updateThreshold: (id, threshold) => api.put(`/alerts/threshold/${id}`, { stock_threshold: threshold })
};

export const documents = {
  upload: (equipmentId, file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post(`/documents/upload/${equipmentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getByEquipment: (equipmentId) => api.get(`/documents/equipment/${equipmentId}`),
  getFile: (filename) => api.get(`/documents/file/${filename}`, { responseType: 'blob' }),
  delete: (equipmentId, filename) => api.delete(`/documents/${equipmentId}/${filename}`)
};

export const users = {
  getAll: () => api.get('/users'),
  create: (userData) => api.post('/users', userData),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
  getActivity: (id) => api.get(`/users/${id}/activity`)
};

export const reports = {
  getUsage: () => api.get('/reports/usage'),
  getHistory: (params) => api.get('/reports/history', { params }),
  export: (type, format = 'csv') => api.get('/reports/export', {
    params: { type, format },
    responseType: 'blob'
  })
};

export default api;