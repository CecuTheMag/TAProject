import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { createSchool, getSchools, createSchoolAdmin, getSchoolAdmins, getSystemStats, getSystemInfo, parseAccdbFile, importAccdbData, proxyEquipmentRequest, proxyDashboardStats } from '../controllers/systemAdmin.js';
import pool from '../database.js';
import bcrypt from 'bcryptjs';
import XLSX from 'xlsx';
import axios from 'axios';

const getMainDBData = async (query, params = []) => {
  try {
    const response = await axios.post(
      `${process.env.MAIN_API_URL || 'http://backend:5000'}/api/internal/query`,
      { query, params },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.MAIN_API_KEY || 'internal_api_key_secure_2026'
        },
        timeout: 15000
      }
    );
    return response.data;
  } catch (error) {
    console.error('Main DB query error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      status: error.response?.status
    });
    throw new Error(`Main DB communication failed: ${error.message}`);
  }
};

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(authenticateToken);

router.get('/stats', getSystemStats);
router.get('/system-info', getSystemInfo);
router.get('/schools', getSchools);
router.post('/schools', createSchool);
router.get('/admins', getSchoolAdmins);
router.get('/school-admins', getSchoolAdmins);
router.post('/admins', createSchoolAdmin);
router.post('/school-admins', createSchoolAdmin);

// Get school admin by ID
router.get('/school-admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, username, email, is_system_admin, created_at FROM admin_users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School admin not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get school admin error:', error);
    res.status(500).json({ error: 'Failed to fetch school admin' });
  }
});
router.get('/users', async (req, res) => {
  try {
    console.log('getUsers called with query:', req.query);
    const { schoolId } = req.query;
    
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required', users: [] });
    }
    
    // Get school code for schema
    const schoolResult = await pool.query('SELECT code, name FROM schools WHERE id = $1', [schoolId]);
    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: 'School not found', users: [] });
    }
    
    const school = schoolResult.rows[0];
    const schoolSchema = `school_${school.code}`;
    
    // Query users from school-specific schema
    const query = `
      SELECT u.id, u.username, u.email, u.role, u.grade_level, u.subject_specialization, u.created_at, $1 as school_name
      FROM "${schoolSchema}".users u
      ORDER BY u.created_at DESC
    `;
    
    console.log('Executing schema query:', query);
    console.log('School schema:', schoolSchema);
    
    const result = await getMainDBData(query, [school.name]);
    console.log(`Found ${result.rows?.length || 0} users in ${schoolSchema}`);
    
    res.json({ 
      users: result.rows || [], 
      school_schema: schoolSchema,
      user_count: result.rows?.length || 0
    });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ error: 'Failed to fetch users', users: [] });
  }
});
router.post('/parse-accdb', upload.single('file'), parseAccdbFile);
router.post('/import-accdb', upload.single('file'), importAccdbData);
router.delete('/admins/:id', async (req, res) => res.status(501).json({ error: 'Not implemented' }));
router.put('/schools/:id', async (req, res) => res.status(501).json({ error: 'Not implemented' }));
router.delete('/schools/:id', async (req, res) => res.status(501).json({ error: 'Not implemented' }));

router.post('/import-users', upload.single('file'), async (req, res) => {
  try {
    const { nameCol, emailCol, phoneCol, roleCol, schoolId } = req.body;
    
    // Get school code for schema
    const schoolResult = await pool.query('SELECT code FROM schools WHERE id = $1', [schoolId]);
    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }
    
    const schoolCode = schoolResult.rows[0].code;
    const schoolSchema = `school_${schoolCode}`;
    
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    const imported = [];
    const errors = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[nameCol] || !row[emailCol]) continue;
      
      const name = row[nameCol];
      const email = row[emailCol];
      const phone = row[phoneCol] || '';
      const roleSubject = row[roleCol] || '';
      
      const isTeacher = ['MATHEMATICS', 'BULGARIAN', 'ENGLISH', 'HISTORY', 'GEOGRAPHY', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'PHYSICAL_EDUCATION', 'ART', 'MUSIC', 'TECHNOLOGY', 'COMPUTER_SCIENCE', 'GERMAN', 'FRENCH', 'PHILOSOPHY', 'PSYCHOLOGY', 'ADMINISTRATOR'].includes(roleSubject.toUpperCase());
      const role = roleSubject.toUpperCase() === 'ADMINISTRATOR' ? 'admin' : (isTeacher ? 'teacher' : 'student');
      
      try {
        const hashedPassword = await bcrypt.hash('password123', 12);
        
        // Insert into school-specific schema
        const insertQuery = `
          INSERT INTO "${schoolSchema}".users (username, email, password, role, grade_level, subject_specialization, phone, password_set) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
          ON CONFLICT (email) DO UPDATE SET 
          username = EXCLUDED.username,
          role = EXCLUDED.role,
          grade_level = EXCLUDED.grade_level,
          subject_specialization = EXCLUDED.subject_specialization,
          phone = EXCLUDED.phone,
          password_set = EXCLUDED.password_set
          RETURNING id
        `;
        
        const result = await getMainDBData(insertQuery, [
          name.toLowerCase().replace(/\s+/g, ''), 
          email, 
          hashedPassword, 
          role, 
          name, // grade_level field used for full name
          roleSubject, 
          phone, 
          false
        ]);
        
        imported.push({ name, email, role, schema: schoolSchema });
      } catch (err) {
        errors.push({ row: i + 1, name, email, error: err.message });
      }
    }
    
    res.json({ 
      imported: imported.length, 
      errors, 
      details: imported,
      school_schema: schoolSchema
    });
  } catch (error) {
    console.error('Import users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy routes for school management
router.get('/proxy/equipment', proxyEquipmentRequest);
router.get('/proxy/dashboard/stats', proxyDashboardStats);

export default router;
