import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import pool from '../database.js';

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password } = value;
    
    // Check if email exists in school data
    const schoolDataCheck = await pool.query(
      'SELECT * FROM school_data WHERE email = $1',
      [email]
    );
    
    if (schoolDataCheck.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Email not found in school system. Please contact your administrator.' 
      });
    }
    
    const schoolUser = schoolDataCheck.rows[0];
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Determine role and school from school data
    const isTeacher = ['MATHEMATICS', 'BULGARIAN', 'ENGLISH', 'HISTORY', 'GEOGRAPHY', 
                      'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'PHYSICAL_EDUCATION', 'ART', 
                      'MUSIC', 'TECHNOLOGY', 'COMPUTER_SCIENCE', 'GERMAN', 'FRENCH', 
                      'PHILOSOPHY', 'PSYCHOLOGY', 'ADMINISTRATOR'].includes(schoolUser.role);
    
    const role = schoolUser.role === 'ADMINISTRATOR' ? 'admin' : (isTeacher ? 'teacher' : 'student');
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role, school_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, school_id, created_at',
      [username, email, hashedPassword, role, 1] // Default school_id = 1 for now
    );

    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    res.status(201).json({
      message: 'Account created successfully',
      user: result.rows[0],
      token
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = value;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userResponse = { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role, 
      school_id: user.school_id,
      is_system_admin: Boolean(user.is_system_admin),
      subject_id: user.subject_id, 
      created_at: user.created_at 
    };

    // console.log('Login response user object:', userResponse);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

export const testDB = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
    const adminCount = result.rows[0].count;
    
    const allUsers = await pool.query('SELECT id, username, email, role, is_system_admin FROM users LIMIT 5');
    
    // Check specifically for system admin
    const systemAdmin = await pool.query('SELECT id, username, email, role, is_system_admin FROM users WHERE is_system_admin = true');
    
    res.json({ 
      message: 'Database connection working',
      adminCount: parseInt(adminCount),
      sampleUsers: allUsers.rows,
      systemAdmins: systemAdmin.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    });
  }
};