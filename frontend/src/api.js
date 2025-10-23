// API Configuration - Centralized HTTP client for backend communication
import axios from 'axios';

// Dynamic API URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? `${window.location.origin}/api`  // Production: use nginx proxy
  : `http://${window.location.hostname}:5000`; // Development: direct backend

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication API endpoints
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.get('/auth/logout'),
};

// Equipment management API endpoints
export const equipment = {
  getAll: (params) => api.get('/equipment', { params }), // Get all with filtering
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data), // Create new equipment
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  updateRepair: (data) => api.put('/equipment/repair', data), // Mark as under repair
  completeRepair: (data) => api.put('/equipment/repair-complete', data), // Complete repair
  retireFleet: (data) => api.put('/equipment/retire-fleet', data), // Bulk retire
  getGroups: () => api.get('/equipment/groups'), // Get grouped equipment
  getLowStock: () => api.get('/equipment/low-stock'), // Low stock alerts
  searchIndividual: (serial) => api.get(`/equipment/search/${encodeURIComponent(serial)}`), // QR search
};

// Equipment request/borrowing API endpoints
export const requests = {
  create: (data) => api.post('/request', data), // Submit new request
  getUserRequests: () => api.get('/request'), // Get user's requests
  getAllRequests: () => api.get('/request/manager'), // Admin: get all requests
  approve: (id) => api.put(`/request/${id}/approve`), // Admin: approve request
  reject: (id) => api.put(`/request/${id}/reject`), // Admin: reject request
  return: (id, data) => api.put(`/request/${id}/return`, data), // Return equipment
  earlyReturn: (id, data) => api.put(`/request/${id}/early-return`, data), // Early return
};

// Dashboard statistics API endpoints
export const dashboard = {
  getStats: () => api.get('/dashboard/stats'), // Overview statistics
  getActivity: () => api.get('/dashboard/activity'), // Recent activity
  getAlerts: () => api.get('/dashboard/alerts'), // System alerts
};

// Alert management API endpoints
export const alerts = {
  getLowStock: () => api.get('/equipment/low-stock'), // Low stock items
  getOverdue: () => api.get('/alerts/overdue'), // Overdue equipment
  updateThreshold: (baseSerial, threshold) => api.put(`/alerts/threshold/${encodeURIComponent(baseSerial)}`, { stock_threshold: threshold }) // Update stock threshold
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