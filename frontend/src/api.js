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

export default api;