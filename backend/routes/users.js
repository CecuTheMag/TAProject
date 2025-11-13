import express from 'express';
import pool from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware.js';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  createUser,
  getUserActivity
} from '../controllers/users.js';

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.post('/', authenticateToken, requireAdmin, createUser);
router.put('/:id/role', authenticateToken, requireAdmin, updateUserRole);
router.put('/:id/subject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_id } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET subject_id = $1 WHERE id = $2 RETURNING *',
      [subject_id || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user subject error:', error);
    res.status(500).json({ error: 'Failed to update user subject' });
  }
});
router.get('/:id/activity', authenticateToken, requireAdmin, getUserActivity);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

export default router;