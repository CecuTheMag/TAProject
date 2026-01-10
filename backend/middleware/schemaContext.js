import pool from '../database.js';

/**
 * Middleware to set PostgreSQL search_path based on user's school
 * Ensures all queries run in the correct school schema
 */
export const setSchoolContext = async (req, res, next) => {
  if (!req.user || !req.user.school_id) {
    return next(); // System admin or no school context
  }

  try {
    // Get school code from school_id
    const result = await pool.query('SELECT code FROM schools WHERE id = $1', [req.user.school_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    const schoolCode = result.rows[0].code;
    const schemaName = `school_${schoolCode.toLowerCase()}`;
    
    // Get a client from the pool and set search_path
    const client = await pool.connect();
    await client.query(`SET search_path TO ${schemaName}, public`);
    
    // Attach client to request so it can be released later
    req.dbClient = client;
    req.schoolSchema = schemaName;
    req.schoolCode = schoolCode;
    
    // Override pool.query to use this client
    req.query = (text, params) => client.query(text, params);
    
    // Release client after response
    res.on('finish', () => {
      client.release();
    });
    
    next();
  } catch (error) {
    console.error('Schema context error:', error);
    res.status(500).json({ error: 'Failed to set school context' });
  }
};

/**
 * Execute query in school-specific schema
 */
export const queryInSchema = async (schemaName, text, params) => {
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO ${schemaName}, public`);
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};
