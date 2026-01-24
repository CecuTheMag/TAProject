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
    
    // Create school in admin database
    const result = await pool.query(
      'INSERT INTO schools (name, code, address, phone, email, domain) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, code, address || null, phone || null, email || null, domain || null]
    );

    const school = result.rows[0];
    
    // Create dedicated schema in main database
    try {
      await getMainDBData(
        'INSERT INTO schools (id, name, code, address, phone, email, domain) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [school.id, name, code, address || null, phone || null, email || null, domain || null]
      );
      
      // Create dedicated schema for this school
      await getMainDBData(`CREATE SCHEMA IF NOT EXISTS school_${school.id}`);
    } catch (mainDbError) {
      console.warn('Main DB school creation failed:', mainDbError.message);
    }
    
    res.status(201).json({
      message: 'School created successfully with dedicated schema',
      school
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
    console.log('getSchools called');
    
    // Query admin database for schools
    const adminSchools = await pool.query(`
      SELECT s.*, 
             0 as user_count,
             0 as admin_count
      FROM schools s
      ORDER BY s.created_at DESC
    `);
    
    console.log('Admin DB schools:', adminSchools.rows.length);

    // Also try to get schools from main database
    let mainSchools = [];
    try {
      const mainSchoolsResult = await getMainDBData(`
        SELECT s.*, 
               COUNT(DISTINCT u.id) as user_count,
               COUNT(DISTINCT CASE WHEN u.role = 'admin' THEN u.id END) as admin_count
        FROM schools s
        LEFT JOIN users u ON s.id = u.school_id
        GROUP BY s.id, s.name, s.code, s.address, s.phone, s.email, s.domain, s.created_at
        ORDER BY s.created_at DESC
      `);
      if (mainSchoolsResult.rows) {
        mainSchools = mainSchoolsResult.rows;
      }
      console.log('Main DB schools:', mainSchools.length);
    } catch (apiError) {
      console.warn('Could not fetch schools from main DB:', apiError.message);
    }

    // Combine schools from both databases, prioritizing main DB data
    const schoolMap = new Map();
    
    // Add admin schools first
    adminSchools.rows.forEach(school => {
      schoolMap.set(school.id, school);
    });
    
    // Override with main DB schools if they exist
    mainSchools.forEach(school => {
      schoolMap.set(school.id, school);
    });
    
    const schools = Array.from(schoolMap.values());
    console.log('Combined schools:', schools.length);

    res.json({ schools });
  } catch (error) {
    console.error('getSchools error:', error.message);
    res.status(500).json({ error: 'Failed to fetch schools', schools: [] });
  }
};

export const createSchoolAdmin = async (req, res) => {
  try {
    const { error, value } = schoolAdminSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password, school_id } = value;
    
    // Check if school exists in admin database
    const schoolCheck = await pool.query('SELECT id, code FROM schools WHERE id = $1', [school_id]);
    if (!schoolCheck.rows || schoolCheck.rows.length === 0) {
      return res.status(400).json({ error: 'School not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create admin in main database with school schema context
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
    // Query main database for school admins via API
    const result = await getMainDBData(`
      SELECT u.id, u.username, u.email, u.created_at, s.name as school_name, s.code as school_code
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.role = 'admin'
      ORDER BY u.created_at DESC
    `);

    res.json({ admins: result.rows || [] });
  } catch (error) {
    console.error('getSchoolAdmins error:', error.message);
    res.status(500).json({ error: 'Failed to fetch school admins', admins: [] });
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
    console.log('=== IMPORT REQUEST START ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mapping = JSON.parse(req.body.mapping);
    const schoolId = parseInt(req.body.school_id);
    
    console.log('=== IMPORT REQUEST DEBUG ===');
    console.log('Raw school_id from request:', req.body.school_id);
    console.log('Parsed school_id:', schoolId);
    console.log('School_id type:', typeof schoolId);
    console.log('Mapping:', mapping);
    
    if (!schoolId || isNaN(schoolId)) {
      console.log('ERROR: Invalid school_id');
      return res.status(400).json({ error: 'Valid school selection is required' });
    }
    
    console.log('Import request - School ID:', schoolId, 'Type:', typeof schoolId);
    
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
    console.log('About to call processImportAsync with schoolId:', schoolId);
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
    const parsedSchoolId = parseInt(schoolId);
    console.log(`Starting import process for school ${parsedSchoolId} (type: ${typeof parsedSchoolId})`);
    
    // Check if school exists in main database (not admin database)
    let schoolExists = false;
    try {
      const schoolCheck = await getMainDBData('SELECT id FROM schools WHERE id = $1', [parsedSchoolId]);
      schoolExists = schoolCheck.rows && schoolCheck.rows.length > 0;
      console.log(`School ${parsedSchoolId} exists in main database: ${schoolExists}`);
    } catch (error) {
      console.error('Error checking school in main database:', error.message);
    }
    
    if (!schoolExists) {
      console.error(`School with ID ${parsedSchoolId} does not exist in main database`);
      fs.unlinkSync(filePath);
      return;
    }

    // Convert ACCDB to CSV
    console.log('Converting ACCDB to CSV...');
    const { stdout } = await execAsync(`mdb-tables -1 "${filePath}"`);
    const tables = stdout.trim().split('\n').filter(t => t.trim());
    
    if (tables.length === 0) {
      fs.unlinkSync(filePath);
      console.error('No tables found in database file');
      return;
    }
    
    const tableName = tables[0];
    console.log(`Found table: ${tableName}`);
    
    const csvPath = filePath + '.csv';
    await execAsync(`mdb-export "${filePath}" "${tableName}" > "${csvPath}"`);
    
    // Read CSV data
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.split('\n').filter(line => line.trim());
    
    console.log(`CSV has ${lines.length} lines`);
    
    if (lines.length < 2) {
      fs.unlinkSync(filePath);
      fs.unlinkSync(csvPath);
      console.error('No data found in file');
      return;
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    console.log('CSV headers:', headers);
    console.log('Mapping:', mapping);
    
    const nameIndex = headers.indexOf(mapping.name);
    const emailIndex = headers.indexOf(mapping.email);
    const phoneIndex = mapping.phone ? headers.indexOf(mapping.phone) : -1;
    const roleIndex = mapping.role ? headers.indexOf(mapping.role) : -1;

    console.log(`Column indexes - Name: ${nameIndex}, Email: ${emailIndex}, Phone: ${phoneIndex}, Role: ${roleIndex}`);

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

    console.log(`Processing ${lines.length - 1} data rows...`);

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.replace(/"/g, '').trim());
      
      const rawName = row[nameIndex];
      const email = row[emailIndex];
      const phone = phoneIndex >= 0 ? row[phoneIndex] : null;
      const role = roleIndex >= 0 ? row[roleIndex] : '';

      if (!rawName || !email) {
        console.log(`Skipping row ${i}: missing name or email`);
        continue;
      }

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

        // Generate clean username from name, not email
        const baseUsername = formattedName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Ensure username uniqueness by checking database
        let username = baseUsername;
        let counter = 1;
        while (true) {
          const existingUser = await getMainDBData(
            'SELECT id FROM users WHERE username = $1',
            [username]
          );
          if (!existingUser.rows || existingUser.rows.length === 0) {
            break; // Username is unique
          }
          username = `${baseUsername}${counter}`;
          counter++;
        }
        
        const defaultPassword = 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        console.log(`Importing user ${i}: ${formattedName} (${username}) -> ${userRole} for school ${parsedSchoolId}`);

        // Insert user with formatted name and original role data
        const result = await getMainDBData(
          `INSERT INTO users (username, email, password, role, school_id, grade_level, subject_specialization) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           ON CONFLICT (email) DO UPDATE SET 
           username = EXCLUDED.username,
           role = EXCLUDED.role,
           school_id = EXCLUDED.school_id,
           grade_level = EXCLUDED.grade_level,
           subject_specialization = EXCLUDED.subject_specialization
           RETURNING id`,
          [username, email, hashedPassword, userRole, parsedSchoolId, formattedName, role]
        );
        
        if (result.rows && result.rows.length > 0) {
          imported++;
          console.log(`Successfully imported user: ${formattedName}`);
        } else {
          console.log(`User already exists (updated): ${formattedName}`);
        }
      } catch (error) {
        console.error(`Error importing row ${i}:`, error.message);
        errors.push(`Row ${i}: ${error.message}`);
      }
    }

    // Clean up files
    fs.unlinkSync(filePath);
    fs.unlinkSync(csvPath);

    console.log(`\n=== IMPORT COMPLETED ===`);
    console.log(`Total processed: ${lines.length - 1} rows`);
    console.log(`Successfully imported: ${imported} users`);
    console.log(`Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('Error details:', errors);
    }
  } catch (error) {
    console.error('Async import error:', error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

export const getSystemStats = async (req, res) => {
  try {
    console.log('getSystemStats called');
    
    // Test admin database connection first
    await pool.query('SELECT 1');
    console.log('Admin DB connection OK');
    
    // Ensure tables exist with proper columns
    await pool.query(`
      ALTER TABLE admin_users 
      ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT true
    `);
    
    // Get admin database stats
    const adminSchoolCount = await pool.query('SELECT COUNT(*) as count FROM schools');
    const adminUserCount = await pool.query('SELECT COUNT(*) as count FROM admin_users');
    const systemAdminCount = await pool.query('SELECT COUNT(*) as count FROM admin_users WHERE is_system_admin = true');
    
    console.log('Admin DB school count:', adminSchoolCount.rows[0]?.count);
    console.log('Admin DB user count:', adminUserCount.rows[0]?.count);
    console.log('System admin count:', systemAdminCount.rows[0]?.count);

    // Query main database for user stats via API
    let mainStats = { total_users: 0, school_admins: 0, main_schools: 0 };
    try {
      const userStatsResult = await getMainDBData(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as school_admins,
          (SELECT COUNT(*) FROM schools) as main_schools
        FROM users
      `);
      if (userStatsResult.rows && userStatsResult.rows[0]) {
        mainStats = userStatsResult.rows[0];
      }
      console.log('Main DB stats:', mainStats);
    } catch (apiError) {
      console.warn('Could not fetch main DB stats:', apiError.message);
    }

    const combinedStats = {
      active_schools: Math.max(
        parseInt(adminSchoolCount.rows[0]?.count || 0),
        parseInt(mainStats.main_schools || 0)
      ),
      system_admins: parseInt(systemAdminCount.rows[0]?.count || 0),
      school_admins: parseInt(mainStats.school_admins || 0),
      total_users: parseInt(mainStats.total_users || 0),
      total_admin_users: parseInt(adminUserCount.rows[0]?.count || 0)
    };
    
    console.log('Combined stats:', combinedStats);
    res.json({ stats: combinedStats });
  } catch (error) {
    console.error('getSystemStats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch system stats: ' + error.message,
      stats: {
        active_schools: 0,
        system_admins: 0,
        school_admins: 0,
        total_users: 0,
        total_admin_users: 0
      }
    });
  }
};
