import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // Add custom header to identify admin panel requests
  config.headers['X-Admin-Panel'] = 'true';
  
  return config;
});

export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }
};

export const systemAdmin = {
  getStats: () => api.get('/system-admin/stats'),
  getSystemInfo: () => api.get('/system-admin/system-info'),
  getSchools: () => api.get('/system-admin/schools'),
  createSchool: (data) => api.post('/system-admin/schools', data),
  updateSchool: (id, data) => api.put(`/system-admin/schools/${id}`, data),
  deleteSchool: (id) => api.delete(`/system-admin/schools/${id}`),
  getAdmins: () => api.get('/system-admin/admins'),
  createAdmin: (data) => api.post('/system-admin/admins', data),
  deleteAdmin: (id) => api.delete(`/system-admin/admins/${id}`),
  getUsers: (schoolId) => api.get('/system-admin/users', { params: schoolId ? { schoolId } : {} }),
  importUsers: (formData) => api.post('/system-admin/import-users', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Equipment API for school management
export const equipment = {
  getAll: () => api.get('/system-admin/proxy/equipment'),
  searchIndividual: (serialNumber) => api.get(`/system-admin/proxy/equipment/search/${serialNumber}`),
  syncStatus: () => api.post('/system-admin/proxy/equipment/sync-status')
};

// Dashboard API for school management
export const dashboard = {
  getStats: () => api.get('/system-admin/proxy/dashboard/stats')
};

export default api;
