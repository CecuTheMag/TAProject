import jwt from 'jsonwebtoken';
import pool from '../database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Use school schema if available, otherwise fall back to public
    let userResult;
    if (req.schoolSchema) {
      // Query from school schema
      userResult = await pool.query(
        `SELECT id, username, email, role, grade_level, subject_specialization, subject_id FROM "${req.schoolSchema}".users WHERE id = $1`,
        [decoded.userId]
      );
    } else {
      // Fallback to public schema
      userResult = await pool.query(
        'SELECT id, username, email, role, grade_level, subject_specialization, subject_id FROM users WHERE id = $1',
        [decoded.userId]
      );
    }

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};