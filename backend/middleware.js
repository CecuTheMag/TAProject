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
    
    // First try to find user in public.users (legacy)
    let result = await pool.query('SELECT * FROM public.users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length > 0) {
      req.user = result.rows[0];
      return next();
    }
    
    // If not found in public.users, search in school schemas
    if (decoded.schoolCode) {
      const schoolSchema = `school_${decoded.schoolCode}`;
      try {
        result = await pool.query(`SELECT * FROM "${schoolSchema}".users WHERE id = $1`, [decoded.userId]);
        if (result.rows.length > 0) {
          req.user = { ...result.rows[0], school_code: decoded.schoolCode };
          return next();
        }
      } catch (schemaError) {
        console.log(`Schema ${schoolSchema} not found or user not in schema`);
      }
    }
    
    // If still not found, try to find in any school schema
    const schools = await pool.query('SELECT code FROM schools');
    for (const school of schools.rows) {
      try {
        const schoolSchema = `school_${school.code}`;
        result = await pool.query(`SELECT * FROM "${schoolSchema}".users WHERE id = $1`, [decoded.userId]);
        if (result.rows.length > 0) {
          req.user = { ...result.rows[0], school_code: school.code };
          return next();
        }
      } catch (schemaError) {
        // Schema doesn't exist or user not found, continue
      }
    }
    
    return res.status(401).json({ error: 'Invalid token - user not found' });
  } catch (error) {
    console.error('Auth error:', error);
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
  console.log('Role check - User role:', req.user?.role, 'User:', req.user?.username);
  if (!req.user) {
    return res.status(403).json({ error: 'User not authenticated' });
  }
  if (!['teacher', 'manager', 'admin'].includes(req.user.role)) {
    console.log('Access denied - Role required: teacher/manager/admin, User has:', req.user.role);
    return res.status(403).json({ error: 'Teacher, Manager or Admin access required' });
  }
  next();
};