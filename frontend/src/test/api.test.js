import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { 
  equipment, 
  requests, 
  auth, 
  users, 
  dashboard, 
  reports, 
  alerts, 
  education,
  documents 
} from '../api';

// Mock axios
vi.mock('axios');

describe('API Layer Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Equipment API', () => {
    it('should fetch all equipment', async () => {
      const mockData = [
        { id: 1, name: 'Laptop', type: 'electronics', status: 'available' },
        { id: 2, name: 'Projector', type: 'electronics', status: 'checked_out' }
      ];
      
      axios.get.mockResolvedValueOnce({ data: mockData });
      
      const result = await equipment.getAll();
      
      expect(axios.get).toHaveBeenCalledWith('/api/equipment');
      expect(result.data).toEqual(mockData);
    });

    it('should create new equipment', async () => {
      const newEquipment = {
        name: 'New Laptop',
        type: 'electronics',
        serial_number: 'SN123456',
        purchase_date: '2024-01-01',
        status: 'available'
      };
      
      const mockResponse = { id: 3, ...newEquipment };
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await equipment.create(newEquipment);
      
      expect(axios.post).toHaveBeenCalledWith('/api/equipment', newEquipment);
      expect(result.data).toEqual(mockResponse);
    });

    it('should update equipment', async () => {
      const updateData = { name: 'Updated Laptop', status: 'under_repair' };
      const mockResponse = { id: 1, ...updateData };
      
      axios.put.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await equipment.update(1, updateData);
      
      expect(axios.put).toHaveBeenCalledWith('/api/equipment/1', updateData);
      expect(result.data).toEqual(mockResponse);
    });

    it('should delete equipment', async () => {
      axios.delete.mockResolvedValueOnce({ data: { success: true } });
      
      const result = await equipment.delete(1);
      
      expect(axios.delete).toHaveBeenCalledWith('/api/equipment/1');
      expect(result.data.success).toBe(true);
    });

    it('should search equipment by query', async () => {
      const mockResults = [{ id: 1, name: 'Laptop Pro' }];
      axios.get.mockResolvedValueOnce({ data: mockResults });
      
      const result = await equipment.search('laptop');
      
      expect(axios.get).toHaveBeenCalledWith('/api/equipment/search?query=laptop');
      expect(result.data).toEqual(mockResults);
    });

    it('should get equipment by ID', async () => {
      const mockEquipment = { id: 1, name: 'Laptop', type: 'electronics' };
      axios.get.mockResolvedValueOnce({ data: mockEquipment });
      
      const result = await equipment.getById(1);
      
      expect(axios.get).toHaveBeenCalledWith('/api/equipment/1');
      expect(result.data).toEqual(mockEquipment);
    });

    it('should generate QR code for equipment', async () => {
      const mockQR = { qr_code: 'base64encodedstring', serial_number: 'SN123' };
      axios.get.mockResolvedValueOnce({ data: mockQR });
      
      const result = await equipment.generateQR(1);
      
      expect(axios.get).toHaveBeenCalledWith('/api/equipment/1/qr');
      expect(result.data).toHaveProperty('qr_code');
    });

    it('should handle API errors gracefully', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network Error'));
      
      await expect(equipment.getAll()).rejects.toThrow('Network Error');
    });
  });

  describe('Requests API', () => {
    it('should create a new request', async () => {
      const requestData = {
        equipment_id: 1,
        user_id: 5,
        purpose: 'Class presentation',
        needed_date: '2024-03-15'
      };
      
      const mockResponse = { id: 1, status: 'pending', ...requestData };
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await requests.create(requestData);
      
      expect(axios.post).toHaveBeenCalledWith('/api/request', requestData);
      expect(result.data.status).toBe('pending');
    });

    it('should get user requests', async () => {
      const mockRequests = [
        { id: 1, equipment_id: 1, status: 'pending' },
        { id: 2, equipment_id: 2, status: 'approved' }
      ];
      
      axios.get.mockResolvedValueOnce({ data: mockRequests });
      
      const result = await requests.getUserRequests();
      
      expect(axios.get).toHaveBeenCalledWith('/api/request');
      expect(result.data).toHaveLength(2);
    });

    it('should approve a request', async () => {
      const mockResponse = { id: 1, status: 'approved' };
      axios.put.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await requests.approve(1);
      
      expect(axios.put).toHaveBeenCalledWith('/api/request/1/approve');
      expect(result.data.status).toBe('approved');
    });

    it('should reject a request', async () => {
      const mockResponse = { id: 1, status: 'rejected', reason: 'Not available' };
      axios.put.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await requests.reject(1, 'Not available');
      
      expect(axios.put).toHaveBeenCalledWith('/api/request/1/reject', { reason: 'Not available' });
      expect(result.data.status).toBe('rejected');
    });

    it('should return equipment', async () => {
      const mockResponse = { id: 1, status: 'returned', return_date: '2024-03-20' };
      axios.put.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await requests.return(1);
      
      expect(axios.put).toHaveBeenCalledWith('/api/request/1/return');
      expect(result.data.status).toBe('returned');
    });
  });

  describe('Auth API', () => {
    it('should login user', async () => {
      const credentials = { email: 'test@school.com', password: 'password123' };
      const mockResponse = { 
        token: 'jwt_token_here', 
        user: { id: 1, email: 'test@school.com', role: 'teacher' } 
      };
      
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await auth.login(credentials);
      
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', credentials);
      expect(result.data).toHaveProperty('token');
      expect(result.data.user.role).toBe('teacher');
    });

    it('should register new user', async () => {
      const userData = {
        email: 'new@school.com',
        password: 'password123',
        name: 'John Doe',
        role: 'student'
      };
      
      const mockResponse = { id: 1, ...userData, password: undefined };
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await auth.register(userData);
      
      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', userData);
      expect(result.data.email).toBe('new@school.com');
    });

    it('should logout user', async () => {
      axios.post.mockResolvedValueOnce({ data: { message: 'Logout successful' } });
      
      const result = await auth.logout();
      
      expect(axios.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(result.data.message).toBe('Logout successful');
    });

    it('should verify email', async () => {
      const mockResponse = { verified: true, message: 'Email verified' };
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await auth.verifyEmail('test@school.com', '123456');
      
      expect(axios.post).toHaveBeenCalledWith('/api/auth/verify-email', {
        email: 'test@school.com',
        code: '123456'
      });
      expect(result.data.verified).toBe(true);
    });
  });

  describe('Users API', () => {
    it('should get all users', async () => {
      const mockUsers = [
        { id: 1, email: 'admin@school.com', role: 'admin' },
        { id: 2, email: 'teacher@school.com', role: 'teacher' }
      ];
      
      axios.get.mockResolvedValueOnce({ data: mockUsers });
      
      const result = await users.getAll();
      
      expect(axios.get).toHaveBeenCalledWith('/api/users');
      expect(result.data).toHaveLength(2);
    });

    it('should update user role', async () => {
      const mockResponse = { id: 1, email: 'user@school.com', role: 'manager' };
      axios.put.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await users.updateRole(1, 'manager');
      
      expect(axios.put).toHaveBeenCalledWith('/api/users/1/role', { role: 'manager' });
      expect(result.data.role).toBe('manager');
    });

    it('should delete user', async () => {
      axios.delete.mockResolvedValueOnce({ data: { success: true } });
      
      const result = await users.delete(1);
      
      expect(axios.delete).toHaveBeenCalledWith('/api/users/1');
      expect(result.data.success).toBe(true);
    });
  });

  describe('Dashboard API', () => {
    it('should get dashboard statistics', async () => {
      const mockStats = {
        total_equipment: 150,
        available_equipment: 100,
        checked_out_equipment: 40,
        under_repair: 10
      };
      
      axios.get.mockResolvedValueOnce({ data: mockStats });
      
      const result = await dashboard.getStats();
      
      expect(axios.get).toHaveBeenCalledWith('/api/dashboard/stats');
      expect(result.data.total_equipment).toBe(150);
    });

    it('should get recent activity', async () => {
      const mockActivity = [
        { id: 1, action: 'equipment_created', user: 'admin', timestamp: '2024-03-15' },
        { id: 2, action: 'request_approved', user: 'manager', timestamp: '2024-03-14' }
      ];
      
      axios.get.mockResolvedValueOnce({ data: mockActivity });
      
      const result = await dashboard.getRecentActivity();
      
      expect(axios.get).toHaveBeenCalledWith('/api/dashboard/activity');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('Reports API', () => {
    it('should get usage report', async () => {
      const mockReport = {
        total_requests: 50,
        approved_requests: 40,
        rejected_requests: 5,
        pending_requests: 5
      };
      
      axios.get.mockResolvedValueOnce({ data: mockReport });
      
      const result = await reports.getUsage();
      
      expect(axios.get).toHaveBeenCalledWith('/api/reports/usage');
      expect(result.data.total_requests).toBe(50);
    });

    it('should export report', async () => {
      const mockBlob = new Blob(['csv,data,here'], { type: 'text/csv' });
      axios.get.mockResolvedValueOnce({ data: mockBlob });
      
      const result = await reports.export('csv');
      
      expect(axios.get).toHaveBeenCalledWith('/api/reports/export?format=csv', {
        responseType: 'blob'
      });
    });
  });

  describe('Alerts API', () => {
    it('should get all alerts', async () => {
      const mockAlerts = [
        { id: 1, type: 'low_stock', message: 'Laptops running low', severity: 'high' },
        { id: 2, type: 'overdue', message: 'Equipment overdue', severity: 'medium' }
      ];
      
      axios.get.mockResolvedValueOnce({ data: mockAlerts });
      
      const result = await alerts.getAll();
      
      expect(axios.get).toHaveBeenCalledWith('/api/alerts');
      expect(result.data).toHaveLength(2);
    });

    it('should dismiss alert', async () => {
      axios.put.mockResolvedValueOnce({ data: { success: true } });
      
      const result = await alerts.dismiss(1);
      
      expect(axios.put).toHaveBeenCalledWith('/api/alerts/1/dismiss');
    });
  });

  describe('Education API', () => {
    it('should get all subjects', async () => {
      const mockSubjects = [
        { id: 1, name: 'Mathematics', code: 'MATH' },
        { id: 2, name: 'Physics', code: 'PHYS' }
      ];
      
      axios.get.mockResolvedValueOnce({ data: mockSubjects });
      
      const result = await education.getSubjects();
      
      expect(axios.get).toHaveBeenCalledWith('/api/education/subjects');
      expect(result.data).toHaveLength(2);
    });

    it('should create lesson plan', async () => {
      const lessonPlan = {
        subject_id: 1,
        title: 'Introduction to Algebra',
        description: 'Basic algebraic concepts',
        equipment_needed: [1, 2, 3]
      };
      
      const mockResponse = { id: 1, ...lessonPlan };
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await education.createLessonPlan(lessonPlan);
      
      expect(axios.post).toHaveBeenCalledWith('/api/education/lesson-plans', lessonPlan);
      expect(result.data.id).toBe(1);
    });

    it('should get curriculum data', async () => {
      const mockCurriculum = {
        subjects: [{ id: 1, name: 'Math' }],
        coverage_gaps: [],
        summary: { total_subjects: 10 }
      };
      
      axios.get.mockResolvedValueOnce({ data: mockCurriculum });
      
      const result = await education.getCurriculum();
      
      expect(axios.get).toHaveBeenCalledWith('/api/education/curriculum');
      expect(result.data.summary.total_subjects).toBe(10);
    });
  });

  describe('Documents API', () => {
    it('should upload document', async () => {
      const formData = new FormData();
      formData.append('file', new File(['content'], 'test.pdf'));
      
      const mockResponse = { id: 1, filename: 'test.pdf', url: '/uploads/test.pdf' };
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await documents.upload(formData);
      
      expect(axios.post).toHaveBeenCalledWith('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    });

    it('should get equipment documents', async () => {
      const mockDocs = [
        { id: 1, filename: 'manual.pdf', equipment_id: 1 },
        { id: 2, filename: 'warranty.pdf', equipment_id: 1 }
      ];
      
      axios.get.mockResolvedValueOnce({ data: mockDocs });
      
      const result = await documents.getByEquipment(1);
      
      expect(axios.get).toHaveBeenCalledWith('/api/documents/equipment/1');
      expect(result.data).toHaveLength(2);
    });
  });
});
