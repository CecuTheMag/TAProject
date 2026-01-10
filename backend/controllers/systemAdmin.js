import pool from '../database.js';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { createSchoolSchema } from '../utils/schemaManager.js';

const schoolSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  code: Joi.string().alphanum().min(2).max(50).required(),
  address: Joi.string().max(500).allow(''),
  phone: Joi.string().max(20).allow(''),
  email: Joi.string().email().allow(''),
  domain: Joi.string().max(100).allow('')
});

const schoolAdminSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  school_id: Joi.number().integer().required()
});

export const createSchool = async (req, res) => {
  try {
    const { error, value } = schoolSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, code, address, phone, email, domain } = value;
    
    // Create school record
    const result = await pool.query(
      'INSERT INTO schools (name, code, address, phone, email, domain) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, code, address || null, phone || null, email || null, domain || null]
    );

    // Create dedicated schema for this school
    await createSchoolSchema(code);

    res.status(201).json({
      message: 'School created successfully with dedicated schema',
      school: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'School code already exists' });
    }
    console.error('Create school error:', error);
    res.status(500).json({ error: 'Failed to create school' });
  }
};

export const getSchools = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             COUNT(u.id) as user_count,
             COUNT(CASE WHEN u.role = 'admin' THEN 1 END) as admin_count
      FROM schools s
      LEFT JOIN users u ON s.id = u.school_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);

    res.json({ schools: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
};

export const createSchoolAdmin = async (req, res) => {
  try {
    const { error, value } = schoolAdminSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password, school_id } = value;
    
    // Verify school exists and get code
    const schoolCheck = await pool.query('SELECT id, code FROM schools WHERE id = $1', [school_id]);
    if (schoolCheck.rows.length === 0) {
      return res.status(400).json({ error: 'School not found' });
    }

    const schoolCode = schoolCheck.rows[0].code;
    const schemaName = `school_${schoolCode.toLowerCase()}`;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create admin in school's schema
    const client = await pool.connect();
    try {
      await client.query(`SET search_path TO ${schemaName}, public`);
      const result = await client.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
        [username, email, hashedPassword, 'admin']
      );
      
      // Also create in public schema for authentication
      await client.query(`SET search_path TO public`);
      await client.query(
        'INSERT INTO users (username, email, password, role, school_id) VALUES ($1, $2, $3, $4, $5)',
        [username, email, hashedPassword, 'admin', school_id]
      );

      res.status(201).json({
        message: 'School admin created successfully',
        admin: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create school admin' });
  }
};

export const getSchoolAdmins = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.username, u.email, u.created_at, s.name as school_name, s.code as school_code
      FROM users u
      JOIN schools s ON u.school_id = s.id
      WHERE u.role = 'admin'
      ORDER BY u.created_at DESC
    `);

    res.json({ admins: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch school admins' });
  }
};

export const updateSchoolStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE schools SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({
      message: 'School status updated successfully',
      school: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update school status' });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM schools WHERE status = 'active') as active_schools,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as school_admins,
        (SELECT COUNT(*) FROM users WHERE role IN ('teacher', 'student')) as total_users,
        (SELECT COUNT(*) FROM equipment) as total_equipment
    `);

    res.json({ stats: stats.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
};