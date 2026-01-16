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
    const result = await pool.query(
      'SELECT id, username, email, role, school_id, subject_id, created_at FROM users WHERE school_id = $1 AND role = $2 ORDER BY id ASC LIMIT 1',
      [req.params.schoolId, 'admin']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No admin found for this school' });
    }
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get school admin' });
  }
});

export default router;