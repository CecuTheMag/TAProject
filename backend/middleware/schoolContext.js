import jwt from 'jsonwebtoken';
import pool from '../database.js';

// Helper function to validate school code format
export const validateSchoolCode = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  // Only allow alphanumeric characters, 2-50 chars
  return /^[a-zA-Z0-9]{2,50}$/.test(code);
};

// Helper function to verify school exists in database
const verifySchoolExists = async (schoolCode) => {
  try {
    const result = await pool.query('SELECT code FROM schools WHERE code = $1', [schoolCode]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error verifying school:', error);
    return false;
  }
};

export const setSchoolContext = async (req, res, next) => {
  try {
    let schoolCode = null;
    
    // Method 1: From authenticated user's school_code (set by auth middleware)
    if (req.user && req.user.school_code) {
      schoolCode = req.user.school_code;
      console.log(`School context from user: ${schoolCode}`);
    }
    
    // Method 2: From X-School-Code header (with validation)
    if (!schoolCode && req.headers['x-school-code']) {
      const headerCode = req.headers['x-school-code'];
      if (validateSchoolCode(headerCode)) {
        // For auth routes, don't require school verification
        if (req.path.startsWith('/auth/') || await verifySchoolExists(headerCode)) {
          schoolCode = headerCode;
          console.log(`School context from header: ${schoolCode}`);
        } else {
          console.warn(`Invalid school code in header: ${headerCode}`);
        }
      }
    }
    
    // Method 3: From subdomain (e.g., hbhs.schoolsync.bg) with validation
    if (!schoolCode && req.headers.host) {
      const host = req.headers.host.split(':')[0]; // Remove port
      const subdomain = host.split('.')[0];
      if (subdomain !== 'localhost' && subdomain !== 'admin' && subdomain !== '127') {
        const subdomainCode = subdomain.toUpperCase();
        if (validateSchoolCode(subdomainCode)) {
          // For auth routes, don't require school verification
          if (req.path.startsWith('/auth/') || await verifySchoolExists(subdomainCode)) {
            schoolCode = subdomainCode;
            console.log(`School context from subdomain: ${schoolCode}`);
          } else {
            console.warn(`Invalid school code in subdomain: ${subdomainCode}`);
          }
        }
      }
    }
    
    // Method 4: From query parameter (for testing) - REMOVED for security
    // Query parameters are too easily manipulated, removing this method
    
    // Method 5: Use default school if available
    if (!schoolCode) {
      try {
        const schools = await pool.query('SELECT code FROM schools ORDER BY created_at ASC LIMIT 1');
        if (schools.rows.length > 0) {
          schoolCode = schools.rows[0].code;
          console.log(`School context from default: ${schoolCode}`);
        }
      } catch (error) {
        console.error('Error getting default school:', error);
      }
    }
    
    // If still no school code found, handle gracefully
    if (!schoolCode) {
      // For auth routes, allow without school context
      if (req.path.startsWith('/auth/')) {
        console.log('Auth route - proceeding without school context');
        req.schoolSchema = null;
        req.schoolCode = null;
        return next();
      }
      
      console.error('No school context available');
      return res.status(400).json({ 
        error: 'School context required', 
        message: 'No schools available in system' 
      });
    }
    
    // Final validation: ensure school code is valid before using
    if (schoolCode && !validateSchoolCode(schoolCode)) {
      console.error(`Invalid school code format: ${schoolCode}`);
      return res.status(400).json({ 
        error: 'Invalid school code format', 
        message: 'School code must be alphanumeric, 2-50 characters' 
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
    // Validate schema name to prevent injection
    if (!schema || !/^[a-zA-Z0-9_]+$/.test(schema)) {
      throw new Error('Invalid schema name');
    }
    
    // List of actual table names that should be schema-qualified
    const tableNames = ['users', 'equipment', 'requests', 'subjects', 'lesson_plans', 'condition_logs'];
    
    let schemaQuery = query;
    
    // Replace only known table names with schema-qualified names
    tableNames.forEach(tableName => {
      // FROM table
      schemaQuery = schemaQuery.replace(
        new RegExp(`FROM\\s+${tableName}\\b`, 'gi'),
        `FROM "${schema}".${tableName}`
      );
      // JOIN table
      schemaQuery = schemaQuery.replace(
        new RegExp(`JOIN\\s+${tableName}\\b`, 'gi'),
        `JOIN "${schema}".${tableName}`
      );
      // UPDATE table
      schemaQuery = schemaQuery.replace(
        new RegExp(`UPDATE\\s+${tableName}\\b`, 'gi'),
        `UPDATE "${schema}".${tableName}`
      );
      // INSERT INTO table
      schemaQuery = schemaQuery.replace(
        new RegExp(`INSERT\\s+INTO\\s+${tableName}\\b`, 'gi'),
        `INSERT INTO "${schema}".${tableName}`
      );
    });
    
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