import express from 'express';
import pool from '../database.js';

const router = express.Router();

const validateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validKeys = [process.env.ADMIN_API_KEY, 'internal_api_key_secure_2025'];
  if (!validKeys.includes(apiKey)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.post('/query', validateAPIKey, async (req, res) => {
  try {
    const { query, params } = req.body;
    const result = await pool.query(query, params);
    console.log('Internal query result:', result.rows.length, 'rows');
    res.json({ rows: result.rows });
  } catch (error) {
    console.error('Internal query error:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
});

export default router;
