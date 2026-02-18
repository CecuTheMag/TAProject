import jwt from 'jsonwebtoken';
import pool from '../database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle system admin tokens
    if (decoded.userId === parseInt(process.env.SYSTEM_ADMIN_ID)) {
      req.user = {
        id: parseInt(process.env.SYSTEM_ADMIN_ID),
        username: process.env.SYSTEM_ADMIN_USERNAME,
        email: process.env.SYSTEM_ADMIN_EMAIL,
        role: 'admin',
        is_system_admin: true,
        school_code: decoded.schoolCode || null  // Extract schoolCode from token
      };
      return next();
    }
    
    // Store decoded token for later use
    req.decodedToken = decoded;
    
    // If school code is in token, use it directly
    if (decoded.schoolCode) {
      try {
        const userResult = await pool.query(
          `SELECT id, username, email, role, grade_level, subject_specialization, subject_id FROM "school_${decoded.schoolCode}".users WHERE id = $1`,
          [decoded.userId]
        );
        
        if (userResult.rows.length > 0) {
          req.user = {
            ...userResult.rows[0],
            school_code: decoded.schoolCode
          };
          return next();
        }
      } catch (schemaError) {
        console.log(`Schema school_${decoded.schoolCode} not found or user not in schema`);
      }
    }
    
    // Fallback: search all school schemas for the user
    const schools = await pool.query('SELECT code FROM schools');
    let userFound = false;
    
    for (const school of schools.rows) {
      try {
        const result = await pool.query(
          `SELECT id, username, email, role, grade_level, subject_specialization, subject_id FROM "school_${school.code}".users WHERE id = $1`,
          [decoded.userId]
        );
        
        if (result.rows.length > 0) {
          req.user = {
            ...result.rows[0],
            school_code: school.code
          };
          userFound = true;
          console.log(`User ${decoded.userId} found in school ${school.code}`);
          break;
        }
      } catch (schemaError) {
        // Schema doesn't exist or user not found, continue
      }
    }
    
    if (!userFound) {
      console.error(`User ${decoded.userId} not found in any school schema`);
      return res.status(401).json({ error: 'User not found in any school' });
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
