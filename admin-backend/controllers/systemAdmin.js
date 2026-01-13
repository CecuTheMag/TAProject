import pg from 'pg';
import bcrypt from 'bcryptjs';
import Joi from 'joi';

const { Pool } = pg;

// Connect to main database for school management
const mainPool = new Pool({
  host: process.env.MAIN_DB_HOST || 'postgres',
  port: 5432,
  database: 'SIMS',
  user: 'postgres',
  password: '1337',
  max: 20
});

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

const createSchoolSchema = async (schoolCode) => {
  const schemaName = `school_${schoolCode.toLowerCase()}`;
  const client = await mainPool.connect();
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    await client.query(`SET search_path TO ${schemaName}, public`);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        subject_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        serial_number VARCHAR(100) UNIQUE,
        condition VARCHAR(50) DEFAULT 'good',
        status VARCHAR(50) DEFAULT 'available',
        location VARCHAR(255),
        requires_approval BOOLEAN DEFAULT false,
        quantity INTEGER DEFAULT 1,
        stock_threshold INTEGER DEFAULT 2,
        qr_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        equipment_id INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        purpose TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    client.release();
  }
};

export const createSchool = async (req, res) => {
  try {
    const { error, value } = schoolSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, code, address, phone, email, domain } = value;
    
    const result = await mainPool.query(
      'INSERT INTO schools (name, code, address, phone, email, domain) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, code, address || null, phone || null, email || null, domain || null]
    );

    await createSchoolSchema(code);

    res.status(201).json({
      message: 'School created successfully',
      school: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'School code already exists' });
    }
    res.status(500).json({ error: 'Failed to create school' });
  }
};

export const getSchools = async (req, res) => {
  try {
    const result = await mainPool.query(`
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
    
    const schoolCheck = await mainPool.query('SELECT id, code FROM schools WHERE id = $1', [school_id]);
    if (schoolCheck.rows.length === 0) {
      return res.status(400).json({ error: 'School not found' });
    }

    const schoolCode = schoolCheck.rows[0].code;
    const schemaName = `school_${schoolCode.toLowerCase()}`;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const client = await mainPool.connect();
    try {
      await client.query(`SET search_path TO ${schemaName}, public`);
      const result = await client.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
        [username, email, hashedPassword, 'admin']
      );
      
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
    res.status(500).json({ error: 'Failed to create school admin' });
  }
};

export const getSchoolAdmins = async (req, res) => {
  try {
    const result = await mainPool.query(`
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

export const getSystemStats = async (req, res) => {
  try {
    const stats = await mainPool.query(`
      SELECT 
        (SELECT COUNT(*) FROM schools) as active_schools,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as school_admins,
        (SELECT COUNT(*) FROM users WHERE role IN ('teacher', 'student')) as total_users
    `);

    res.json({ stats: stats.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
};
