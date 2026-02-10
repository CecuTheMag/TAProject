import express from 'express';
import pool from '../database.js';
import { createSchoolSchema } from '../migrations/schema-per-school.js';

const router = express.Router();

const validateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validKeys = [process.env.ADMIN_API_KEY, 'internal_api_key_secure_2025'];
  if (!validKeys.includes(apiKey)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.post('/create-school-schema', validateAPIKey, async (req, res) => {
  try {
    const { schoolCode } = req.body;
    if (!schoolCode) {
      return res.status(400).json({ error: 'School code is required' });
    }
    
    console.log(`Creating schema for school: ${schoolCode}`);
    const success = await createSchoolSchema(schoolCode);
    
    if (success) {
      res.json({ message: `Schema created successfully for school: ${schoolCode}` });
    } else {
      res.status(500).json({ error: 'Failed to create school schema' });
    }
  } catch (error) {
    console.error('Create school schema error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/query', validateAPIKey, async (req, res) => {
  const client = await pool.connect();
  try {
    const { query, params } = req.body;
    
    // Log the query for debugging
    console.log('Internal query:', { query, params });
    
    await client.query('BEGIN');
    const result = await client.query(query, params);
    await client.query('COMMIT');
    
    console.log('Internal query result:', result.rows.length, 'rows');
    
    // If it's an INSERT with ON CONFLICT DO NOTHING and returns 0 rows, check why
    if (query.includes('INSERT') && query.includes('ON CONFLICT') && result.rows.length === 0) {
      console.log('INSERT returned 0 rows - possible conflict or constraint violation');
      
      // If inserting users, check if school exists
      if (query.includes('users') && params.length >= 5) {
        const schoolId = params[4]; // school_id is 5th parameter
        try {
          const schoolCheck = await client.query('SELECT id FROM schools WHERE id = $1', [schoolId]);
          if (schoolCheck.rows.length === 0) {
            console.log(`School with id ${schoolId} does not exist`);
            return res.status(400).json({ 
              error: `School with id ${schoolId} does not exist`,
              code: 'SCHOOL_NOT_FOUND'
            });
          }
        } catch (schoolError) {
          console.log('Error checking school:', schoolError.message);
        }
      }
    }
    
    res.json({ rows: result.rows });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Internal query error:', error);
    res.status(500).json({ error: error.message, code: error.code });
  } finally {
    client.release();
  }
});

export default router;
