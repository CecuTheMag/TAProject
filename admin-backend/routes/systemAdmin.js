import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { createSchool, getSchools, createSchoolAdmin, getSchoolAdmins, getSystemStats, parseAccdbFile, importAccdbData } from '../controllers/systemAdmin.js';
import pool from '../database.js';
import bcrypt from 'bcryptjs';
import XLSX from 'xlsx';
import axios from 'axios';

const getMainDBData = async (query, params = []) => {
  try {
    const response = await axios.post(
      `${process.env.MAIN_API_URL || 'http://localhost:5000'}/api/internal/query`,
      { query, params },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.MAIN_API_KEY || 'internal_api_key_secure_2025'
        },
        timeout: 10000
      }
    );
    return response.data;
  } catch (error) {
    console.error('Main DB query error:', error.message);
    throw error;
  }
};

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(authenticateToken);

router.get('/stats', getSystemStats);
router.get('/schools', getSchools);
router.post('/schools', createSchool);
router.get('/admins', getSchoolAdmins);
router.get('/school-admins', getSchoolAdmins);
router.post('/admins', createSchoolAdmin);
router.post('/school-admins', createSchoolAdmin);
router.get('/users', async (req, res) => {
  try {
    const { schoolId } = req.query;
    let query = `
      SELECT u.id, u.username, u.email, u.role, u.grade_level, u.subject_specialization, u.created_at, s.name as school_name
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
    `;
    const params = [];
    
    if (schoolId) {
      query += ' WHERE u.school_id = $1';
      params.push(schoolId);
    }
    
    query += ' ORDER BY u.created_at DESC';
    
    const result = await getMainDBData(query, params);
    res.json({ users: result.rows || [] });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
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
        const result = await pool.query(
          'INSERT INTO users (username, email, password, role, school_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [name.toLowerCase().replace(/\s+/g, ''), email, hashedPassword, role, schoolId]
        );
        imported.push({ name, email, role });
      } catch (err) {
        errors.push({ row: i + 1, name, email, error: err.message });
      }
    }
    
    res.json({ imported: imported.length, errors, details: imported });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
