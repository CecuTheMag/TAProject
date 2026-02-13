import jwt from 'jsonwebtoken';
import pool from '../database.js';

export const setSchoolContext = async (req, res, next) => {
  try {
    let schoolCode = null;
    
    // Method 1: From authenticated user's school_code (set by auth middleware)
    if (req.user && req.user.school_code) {
      schoolCode = req.user.school_code;
      console.log(`School context from user: ${schoolCode}`);
    }
    
    // Method 2: From X-School-Code header
    if (!schoolCode && req.headers['x-school-code']) {
      schoolCode = req.headers['x-school-code'];
      console.log(`School context from header: ${schoolCode}`);
    }
    
    // Method 3: From subdomain (e.g., hbhs.schoolsync.bg)
    if (!schoolCode && req.headers.host) {
      const host = req.headers.host.split(':')[0]; // Remove port
      const subdomain = host.split('.')[0];
      if (subdomain !== 'localhost' && subdomain !== 'admin' && subdomain !== '127') {
        schoolCode = subdomain.toUpperCase();
        console.log(`School context from subdomain: ${schoolCode}`);
      }
    }
    
    // Method 4: From query parameter (for testing)
    if (!schoolCode && req.query.school) {
      schoolCode = req.query.school.toUpperCase();
      console.log(`School context from query: ${schoolCode}`);
    }
    
    // Method 5: Use default school if available
    if (!schoolCode) {
      const schools = await pool.query('SELECT code FROM schools ORDER BY created_at ASC LIMIT 1');
      if (schools.rows.length > 0) {
        schoolCode = schools.rows[0].code;
        console.log(`School context from default: ${schoolCode}`);
      }
    }
    
    // If still no school code found, return error
    if (!schoolCode) {
      console.error('No school context available');
      return res.status(400).json({ 
        error: 'School context required', 
        message: 'No schools available in system' 
      });
    }
    
    req.schoolSchema = `school_${schoolCode}`;
    req.schoolCode = schoolCode;
    
    // If user was found by auth middleware but doesn't have school_code, update it
    if (req.user && !req.user.school_code) {
      req.user.school_code = schoolCode;
    }
    
    console.log(`✅ School context set: ${schoolCode} -> ${req.schoolSchema}`);
    
    next();
  } catch (error) {
    console.error('Schema context error:', error);
    res.status(500).json({ error: 'Database schema error' });
  }
};

export const queryInSchema = async (schema, query, params = []) => {
  try {
    // Replace table names with schema-qualified names
    let schemaQuery = query
      .replace(/FROM\s+(\w+)/gi, `FROM "${schema}".$1`)
      .replace(/JOIN\s+(\w+)/gi, `JOIN "${schema}".$1`)
      .replace(/UPDATE\s+(\w+)/gi, `UPDATE "${schema}".$1`)
      .replace(/INSERT\s+INTO\s+(\w+)/gi, `INSERT INTO "${schema}".$1`);
    
    const result = await pool.query(schemaQuery, params);
    return result;
  } catch (error) {
    console.error('Query in schema error:', error);
    // Fallback to public schema if school schema doesn't exist
    try {
      const result = await pool.query(query, params);
      return result;
    } catch (fallbackError) {
      console.error('Fallback query error:', fallbackError);
      throw error;
    }
  }
};