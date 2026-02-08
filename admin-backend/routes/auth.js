import express from 'express';
import { login } from '../controllers/auth.js';
import pool from '../database.js';

const router = express.Router();

router.post('/login', login);

// Get school admin by ID (for frontend compatibility)
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

export default router;
