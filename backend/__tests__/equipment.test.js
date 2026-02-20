import request from 'supertest';
import app from '../server.js';
import { pool } from '../database.js';

describe('Equipment API', () => {
  let authToken;
  let testEquipmentId;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/equipment', () => {
    it('should create new equipment', async () => {
      const equipmentData = {
        name: 'Test Laptop',
        type: 'Electronics',
        serial_number: 'TEST123',
        condition: 'excellent',
        status: 'available'
      };

      const response = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(equipmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(equipmentData.name);
      testEquipmentId = response.body.data.id;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('GET /api/equipment', () => {
    it('should get all equipment', async () => {
      const response = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter equipment by type', async () => {
      const response = await request(app)
        .get('/api/equipment?type=Electronics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(item => {
        expect(item.type).toBe('Electronics');
      });
    });
  });

  describe('PUT /api/equipment/:id', () => {
    it('should update equipment', async () => {
      const updateData = {
        name: 'Updated Laptop',
        condition: 'good'
      };

      const response = await request(app)
        .put(`/api/equipment/${testEquipmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/equipment/:id', () => {
    it('should delete equipment', async () => {
      await request(app)
        .delete(`/api/equipment/${testEquipmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});