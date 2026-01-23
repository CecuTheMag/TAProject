import jwt from 'jsonwebtoken';
import pool from './database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle system admin access (fake user ID 999999)
    if (decoded.userId === 999999) {
      req.user = {
        id: 999999,
        username: 'system_admin',
        email: 'system@admin.local',
        role: 'admin',
        is_system_admin: true
      };
      return next();
    }
    
    const result = await pool.query('SELECT * FROM public.users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireSchoolAccess = (req, res, next) => {
  if (!req.user.school_id) {
    return res.status(403).json({ error: 'No school access' });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireTeacherOrAdmin = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Teacher or Admin access required' });
  }
  next();
};

export const requireManagerOrAdmin = (req, res, next) => {
  if (!['manager', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Manager or Admin access required' });
  }
  next();
};

export const requireManagerTeacherOrAdmin = (req, res, next) => {
  if (!['teacher', 'manager', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Teacher, Manager or Admin access required' });
  }
  next();
};