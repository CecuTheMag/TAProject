import jwt from 'jsonwebtoken';
import pool from '../database.js';

export const setSchoolContext = async (req, res, next) => {
  try {
    // Extract school code from request - could be from JWT token, header, or subdomain
    let schoolCode = null;
    
    // Method 1: From Authorization token (if user is logged in)
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (decoded.schoolCode) {
          schoolCode = decoded.schoolCode;
        }
      } catch (tokenError) {
        // Token invalid, continue to other methods
      }
    }
    
    // Method 2: From X-School-Code header
    if (!schoolCode && req.headers['x-school-code']) {
      schoolCode = req.headers['x-school-code'];
    }
    
    // Method 3: From subdomain (e.g., hbhs.assetflow.bg)
    if (!schoolCode && req.headers.host) {
      const host = req.headers.host.split(':')[0]; // Remove port
      const subdomain = host.split('.')[0];
      if (subdomain !== 'localhost' && subdomain !== 'admin' && subdomain !== '127') {
        schoolCode = subdomain.toUpperCase();
      }
    }
    
    // Method 4: From query parameter (for testing)
    if (!schoolCode && req.query.school) {
      schoolCode = req.query.school.toUpperCase();
    }
    
    // Method 5: For admin panel, use default school for now
    if (!schoolCode && req.headers['x-admin-panel']) {
      schoolCode = 'BGVHRFDXSE'; // Default to existing school for admin panel
    }
    
    // If no school code found, return error (except for auth routes)
    if (!schoolCode) {
      return res.status(400).json({ 
        error: 'School context required', 
        message: 'Please provide school code via token, header, or subdomain' 
      });
    }
    
    req.schoolSchema = `school_${schoolCode}`;
    req.schoolCode = schoolCode;
    
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