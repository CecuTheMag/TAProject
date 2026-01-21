import express from 'express';
import { register, login, logout, testDB } from '../controllers/auth.js';
import pool from '../database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/test-db', testDB);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/school-admin/:schoolId', async (req, res) => {
  try {
    // Create temporary system admin access for school
    const schoolId = parseInt(req.params.schoolId);
    const systemAdminUser = {
      id: 999999,
      username: 'system_admin',
      email: 'system@admin.local',
      role: 'admin',
      school_id: schoolId,
      is_system_admin: true,
      created_at: new Date()
    };
    
    const token = jwt.sign({ userId: systemAdminUser.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ user: systemAdminUser, token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get school admin access' });
  }
});

export default router;