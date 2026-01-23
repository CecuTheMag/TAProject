import bcrypt from 'bcryptjs';
import Joi from 'joi';
import pool from '../database.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const queryCache = new Map();
const CACHE_TTL = 5000; // 5 seconds

const getMainDBData = async (query, params = []) => {
  const cacheKey = JSON.stringify({ query, params });
  const cached = queryCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const response = await axios.post(
      `${process.env.MAIN_API_URL || 'http://backend:5000'}/api/internal/query`,
      { query, params },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.MAIN_API_KEY || 'internal_api_key_secure_2025'
        },
        timeout: 10000
      }
    );
    
    queryCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    
    if (queryCache.size > 100) {
      const firstKey = queryCache.keys().next().value;
      queryCache.delete(firstKey);
    }
    
    return response.data;
  } catch (error) {
    console.error('Main DB query error:', error.message);
    throw error;
  }
};

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
    
    const result = await getMainDBData(
      'INSERT INTO schools (name, code, address, phone, email, domain) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, code, address || null, phone || null, email || null, domain || null]
    );

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
    const result = await getMainDBData(`
      SELECT s.*, 
             COUNT(u.id) as user_count,
             COUNT(CASE WHEN u.role = 'admin' THEN 1 END) as admin_count
      FROM schools s
      LEFT JOIN users u ON s.id = u.school_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);

    res.json({ schools: result.rows || [] });
  } catch (error) {
    console.error('getSchools error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch schools', details: error.message });
  }
};

export const createSchoolAdmin = async (req, res) => {
  try {
    const { error, value } = schoolAdminSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password, school_id } = value;
    
    const schoolCheck = await getMainDBData('SELECT id, code FROM schools WHERE id = $1', [school_id]);
    if (!schoolCheck.rows || schoolCheck.rows.length === 0) {
      return res.status(400).json({ error: 'School not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await getMainDBData(
      'INSERT INTO users (username, email, password, role, school_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, created_at',
      [username, email, hashedPassword, 'admin', school_id]
    );

    res.status(201).json({
      message: 'School admin created successfully',
      admin: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Failed to create school admin' });
  }
};

export const getSchoolAdmins = async (req, res) => {
  try {
    const result = await getMainDBData(`
      SELECT u.id, u.username, u.email, u.created_at, s.name as school_name, s.code as school_code
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.role = 'admin'
      ORDER BY u.created_at DESC
    `);

    res.json({ admins: result.rows || [] });
  } catch (error) {
    console.error('getSchoolAdmins error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch school admins', details: error.message });
  }
};

export const parseAccdbFile = async (req, res) => {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Save buffer to temporary file
    const tempDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    tempFilePath = path.join(tempDir, `temp_${Date.now()}_${req.file.originalname}`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Use mdb-tools to extract table structure
    const { stdout } = await execAsync(`mdb-tables -1 "${tempFilePath}"`);
    const tables = stdout.trim().split('\n').filter(t => t.trim());
    
    if (tables.length === 0) {
      return res.status(400).json({ error: 'No tables found in database file' });
    }

    // Get columns from first table
    const tableName = tables[0];
    const { stdout: schemaOutput } = await execAsync(`mdb-schema "${tempFilePath}" -T "${tableName}"`);
    
    // Extract column names from schema
    const columns = [];
    const lines = schemaOutput.split('\n');
    for (const line of lines) {
      const match = line.trim().match(/^\[([^\]]+)\]/);
      if (match) {
        columns.push(match[1]);
      }
    }

    if (columns.length === 0) {
      return res.status(400).json({ error: 'No columns found in database table' });
    }

    res.json({ columns, tableName });
  } catch (error) {
    console.error('Parse ACCDB error:', error);
    res.status(500).json({ 
      error: 'Failed to parse .accdb file. Ensure mdb-tools is installed and file is valid.' 
    });
  } finally {
    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};

export const importAccdbData = async (req, res) => {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mapping = JSON.parse(req.body.mapping);
    const schoolId = req.body.school_id;
    
    if (!schoolId) {
      return res.status(400).json({ error: 'School selection is required' });
    }
    
    // Save buffer to temporary file
    const tempDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    tempFilePath = path.join(tempDir, `import_${Date.now()}_${req.file.originalname}`);
    fs.writeFileSync(tempFilePath, req.file.buffer);
    
    // Send immediate response to prevent timeout
    res.json({ message: 'Import started, processing in background...' });
    
    // Process import asynchronously
    processImportAsync(tempFilePath, mapping, schoolId);
    
  } catch (error) {
    console.error('Import ACCDB error:', error);
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to import .accdb file. Ensure mdb-tools is installed and file is valid.' 
      });
    }
  }
};

const processImportAsync = async (filePath, mapping, schoolId) => {
  try {
    // First check if school exists
    const schoolCheck = await getMainDBData('SELECT id FROM schools WHERE id = $1', [schoolId]);
    if (!schoolCheck.rows || schoolCheck.rows.length === 0) {
      console.error(`School with ID ${schoolId} does not exist`);
      fs.unlinkSync(filePath);
      return;
    }

    // Convert ACCDB to CSV
    const { stdout } = await execAsync(`mdb-tables -1 "${filePath}"`);
    const tables = stdout.trim().split('\n').filter(t => t.trim());
    
    if (tables.length === 0) {
      fs.unlinkSync(filePath);
      console.error('No tables found in database file');
      return;
    }
    
    const tableName = tables[0];
    const csvPath = filePath + '.csv';
    await execAsync(`mdb-export "${filePath}" "${tableName}" > "${csvPath}"`);
    
    // Read CSV data
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      fs.unlinkSync(filePath);
      fs.unlinkSync(csvPath);
      console.error('No data found in file');
      return;
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const nameIndex = headers.indexOf(mapping.name);
    const emailIndex = headers.indexOf(mapping.email);
    const phoneIndex = mapping.phone ? headers.indexOf(mapping.phone) : -1;
    const roleIndex = mapping.role ? headers.indexOf(mapping.role) : -1;

    if (nameIndex === -1 || emailIndex === -1) {
      fs.unlinkSync(filePath);
      fs.unlinkSync(csvPath);
      console.error('Required columns not found in data');
      return;
    }

    // Teacher subjects list
    const teacherSubjects = [
      'MATHEMATICS', 'BULGARIAN', 'ENGLISH', 'HISTORY', 'GEOGRAPHY', 
      'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'PHYSICAL_EDUCATION', 'ART', 
      'MUSIC', 'TECHNOLOGY', 'COMPUTER_SCIENCE', 'GERMAN', 'FRENCH', 'PHILOSOPHY'
    ];

    let imported = 0;
    let errors = [];

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.replace(/"/g, '').trim());
      
      const rawName = row[nameIndex];
      const email = row[emailIndex];
      const phone = phoneIndex >= 0 ? row[phoneIndex] : null;
      const role = roleIndex >= 0 ? row[roleIndex] : '';

      if (!rawName || !email) continue;

      try {
        // Format name properly
        const formattedName = rawName
          .toLowerCase()
          .split(/[\s.]+/)
          .filter(part => part.length > 0)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

        // Determine user role - check if role contains any teacher subject
        let userRole = 'student';
        const roleUpper = role.toUpperCase();
        
        if (teacherSubjects.some(subject => roleUpper.includes(subject))) {
          userRole = 'teacher';
        } else if (role && role.toLowerCase().includes('admin')) {
          userRole = 'admin';
        }

        // Generate clean username from email
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const defaultPassword = 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        // Insert user with formatted name and phone
        const result = await getMainDBData(
          `INSERT INTO users (username, email, password, role, school_id, grade_level, subject_specialization) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           ON CONFLICT (email) DO UPDATE SET 
           username = EXCLUDED.username,
           role = EXCLUDED.role,
           grade_level = EXCLUDED.grade_level,
           subject_specialization = EXCLUDED.subject_specialization
           RETURNING id`,
          [username, email, hashedPassword, userRole, schoolId, formattedName, userRole === 'teacher' ? role : null]
        );
        
        if (result.rows && result.rows.length > 0) {
          imported++;
        }
      } catch (error) {
        errors.push(`Row ${i}: ${error.message}`);
      }
    }

    // Clean up files
    fs.unlinkSync(filePath);
    fs.unlinkSync(csvPath);

    console.log(`Import completed: ${imported} imported, ${errors.length} errors`);
  } catch (error) {
    console.error('Async import error:', error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const stats = await getMainDBData(`
      SELECT 
        (SELECT COUNT(*) FROM schools) as active_schools,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as school_admins,
        (SELECT COUNT(*) FROM users WHERE role IN ('teacher', 'student')) as total_users
    `);

    res.json({ stats: (stats.rows && stats.rows[0]) || { active_schools: 0, school_admins: 0, total_users: 0 } });
  } catch (error) {
    console.error('getSystemStats error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch system stats', details: error.message });
  }
};
