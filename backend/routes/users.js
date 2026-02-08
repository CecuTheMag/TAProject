import express from 'express';
import { setSchoolContext, queryInSchema } from '../middleware/schoolContext.js';

const router = express.Router();

router.use(setSchoolContext);

router.get('/', async (req, res) => {
  try {
    const result = await queryInSchema(req.schoolSchema, 'SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, email, password, role, grade_level, subject_specialization } = req.body;
    const result = await queryInSchema(req.schoolSchema, `
      INSERT INTO users (username, email, password, role, grade_level, subject_specialization)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [username, email, password, role, grade_level, subject_specialization]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const result = await queryInSchema(req.schoolSchema, `
      UPDATE users SET role = $1 WHERE id = $2 RETURNING *
    `, [role, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.put('/:id/subject', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_id } = req.body;
    
    const result = await queryInSchema(req.schoolSchema, `
      UPDATE users SET subject_id = $1 WHERE id = $2 RETURNING *
    `, [subject_id || null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user subject error:', error);
    res.status(500).json({ error: 'Failed to update user subject' });
  }
});

router.get('/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await queryInSchema(req.schoolSchema, `
      SELECT r.*, e.name as equipment_name 
      FROM requests r 
      JOIN equipment e ON r.equipment_id = e.id 
      WHERE r.user_id = $1 
      ORDER BY r.request_date DESC
    `, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await queryInSchema(req.schoolSchema, 'DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;