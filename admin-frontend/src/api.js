import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }
};

export const systemAdmin = {
  getStats: () => api.get('/api/system-admin/stats'),
  getSchools: () => api.get('/api/system-admin/schools'),
  createSchool: (data) => api.post('/api/system-admin/schools', data),
  updateSchool: (id, data) => api.put(`/api/system-admin/schools/${id}`, data),
  deleteSchool: (id) => api.delete(`/api/system-admin/schools/${id}`),
  getAdmins: () => api.get('/api/system-admin/admins'),
  createAdmin: (data) => api.post('/api/system-admin/admins', data),
  deleteAdmin: (id) => api.delete(`/api/system-admin/admins/${id}`),
  importUsers: (formData) => api.post('/api/system-admin/import-users', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;
