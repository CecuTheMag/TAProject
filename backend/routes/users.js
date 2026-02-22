import express from 'express';
import { setSchoolContext, queryInSchema } from '../middleware/schoolContext.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/roleAuth.js';
import crypto from 'crypto';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(setSchoolContext);

router.get('/', async (req, res) => {
  try {
    const result = await queryInSchema(req.schoolSchema, `
      SELECT u.*, s.name as subject_name, s.code as subject_code,
             COUNT(r.id) as total_requests,
             COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_requests,
             COUNT(CASE WHEN r.status = 'approved' THEN 1 END) as approved_requests
      FROM users u
      LEFT JOIN subjects s ON u.subject_id = s.id
      LEFT JOIN requests r ON u.id = r.user_id
      GROUP BY u.id, s.name, s.code
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { username, email, role, grade_level, subject_specialization, phone, subject_id } = req.body;
    
    // Generate cryptographically secure random password
    const bcrypt = await import('bcryptjs');
    const tempPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);
    const hashedPassword = await bcrypt.default.hash(tempPassword, 12);
    
    const result = await queryInSchema(req.schoolSchema, `
      INSERT INTO users (username, email, password, role, grade_level, subject_specialization, phone, subject_id, password_set)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [username, email, hashedPassword, role, grade_level, subject_specialization, phone, subject_id || null, false]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

router.put('/:id/role', requireAdmin, async (req, res) => {
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

router.put('/:id/subject', requireTeacherOrAdmin, async (req, res) => {
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

router.delete('/:id', requireAdmin, async (req, res) => {
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

// Update user profile (own profile or admin can update any)
router.put('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, grade_level, subject_specialization } = req.body;
    
    // Check if user is updating their own profile or is an admin
    const isAdmin = ['admin', 'system_admin'].includes(req.user.role);
    const isOwnProfile = String(req.user.id) === String(id);
    
    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }
    
    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (grade_level !== undefined) {
      updates.push(`grade_level = $${paramIndex++}`);
      values.push(grade_level);
    }
    if (subject_specialization !== undefined) {
      updates.push(`subject_specialization = $${paramIndex++}`);
      values.push(subject_specialization);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await queryInSchema(req.schoolSchema, query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
});

export default router;
