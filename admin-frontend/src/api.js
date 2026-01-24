import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:5005/api'
  : 'http://localhost:5005/api';

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
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }
};

export const systemAdmin = {
  getStats: () => api.get('/system-admin/stats'),
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

export default api;
