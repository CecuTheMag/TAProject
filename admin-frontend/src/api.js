import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://school-sync.org/admin-api';

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
  }),
  parseAccdb: (formData) => api.post('/system-admin/parse-accdb', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  importAccdb: (formData) => api.post('/system-admin/import-accdb', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  createDemoUser: (data) => api.post('/system-admin/demo-users', data)
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

// Education API for school management
export const education = {
  getSubjects: () => api.get('/system-admin/proxy/education/subjects'),
  getLessonPlans: () => api.get('/system-admin/proxy/education/lesson-plans'),
  getCurriculum: () => api.get('/system-admin/proxy/education/curriculum'),
  getCurriculumRecommendations: (subjectCode) => api.get(`/system-admin/proxy/education/curriculum/${subjectCode}/recommendations`),
  createLessonPlan: (data) => api.post('/system-admin/proxy/education/lesson-plans', data),
  createSubject: (data) => api.post('/system-admin/proxy/education/subjects', data)
};

export default api;
