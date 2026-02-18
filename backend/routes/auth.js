import express from 'express';
import { register, login, logout, testDB, sendVerificationCodes, setupPassword } from '../controllers/auth.js';
import pool from '../database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/test-db', testDB);
router.post('/register', register);
router.post('/login', login);
router.post('/send-verification', sendVerificationCodes);
router.post('/setup-password', setupPassword);
router.get('/logout', logout);
router.get('/school-admin/:schoolId', async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    
    // Get school code from database
    const schoolResult = await pool.query('SELECT code FROM schools WHERE id = $1', [schoolId]);
    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }
    
    const schoolCode = schoolResult.rows[0].code;
    
    // Create temporary system admin access for school
    const systemAdminUser = {
      id: parseInt(process.env.SYSTEM_ADMIN_ID),
      username: process.env.SYSTEM_ADMIN_USERNAME,
      email: process.env.SYSTEM_ADMIN_EMAIL,
      role: 'admin',
      school_id: schoolId,
      schoolCode: schoolCode,
      is_system_admin: true,
      created_at: new Date()
    };
    
    const token = jwt.sign({ 
      userId: systemAdminUser.id, 
      schoolCode: schoolCode 
    }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ user: systemAdminUser, token });
  } catch (error) {
    console.error('School admin access error:', error);
    res.status(500).json({ error: 'Failed to get school admin access' });
  }
});

export default router;
