import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import pool from '../database.js';
import { generateVerificationCode, sendEmailVerification, sendSMSVerification } from '../services/notificationService.js';

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verificationSchema = Joi.object({
  email: Joi.string().email().required(),
  emailCode: Joi.string().length(6).required(),
  smsCode: Joi.string().length(6).required()
});

const passwordSetupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().min(6).required(),
  emailCode: Joi.string().length(6).required(),
  smsCode: Joi.string().length(6).required()
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

    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
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
    console.log('🔐 Login attempt:', email);
    
    // First check which school this user belongs to
    let user = null;
    let schoolCode = null;
    
    // Get all schools and check their schemas
    const schools = await pool.query('SELECT id, code FROM schools');
    
    for (const school of schools.rows) {
      try {
        const result = await pool.query(`SELECT * FROM "school_${school.code}".users WHERE email = $1`, [email]);
        if (result.rows.length > 0) {
          user = result.rows[0];
          schoolCode = school.code;
          break;
        }
      } catch (schemaError) {
        // Schema might not exist, continue
      }
    }
    
    // Fallback to public schema
    if (!user) {
      const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        user = result.rows[0];
        // Get school code from school_id
        const schoolResult = await pool.query('SELECT code FROM schools WHERE id = $1', [user.school_id]);
        schoolCode = schoolResult.rows[0]?.code;
      }
    }
    
    console.log('🔍 User lookup result:', user ? 'found' : 'not found', 'School:', schoolCode);
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Email not found in system. Contact your administrator.' });
    }

    // Check if this is a first-time user (password not set)
    if (!user.password_set) {
      console.log('🆕 First-time user detected:', email);
      return res.status(200).json({ 
        requiresSetup: true,
        email: user.email,
        message: 'First-time login detected. Verification codes will be sent.' 
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔑 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userResponse = { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role, 
      school_id: user.school_id,
      subject_id: user.subject_id, 
      created_at: user.created_at,
      schoolCode: schoolCode
    };

    const token = jwt.sign({ 
      userId: user.id, 
      schoolCode: schoolCode 
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log('✅ Login successful:', email, 'School:', schoolCode);
    
    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.log('❌ Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

// Send verification codes for first-time users
export const sendVerificationCodes = async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    if (user.password_set) {
      return res.status(400).json({ error: 'Account already activated' });
    }
    
    // Generate verification codes
    const emailCode = generateVerificationCode();
    const smsCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Update user with verification codes
    await pool.query(
      'UPDATE users SET email_verification_code = $1, sms_verification_code = $2, verification_expires_at = $3, verification_attempts = 0 WHERE email = $4',
      [emailCode, smsCode, expiresAt, email]
    );
    
    // Send codes
    const emailSent = await sendEmailVerification(user.email, emailCode, user.grade_level || user.username);
    const smsSent = user.phone ? await sendSMSVerification(user.phone, smsCode, user.grade_level || user.username) : false;
    
    res.json({ 
      message: 'Verification codes sent',
      emailSent,
      smsSent: !!user.phone && smsSent,
      hasPhone: !!user.phone
    });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Failed to send verification codes' });
  }
};

// Setup password for first-time users
export const setupPassword = async (req, res) => {
  try {
    const { error, value } = passwordSetupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const { email, password, confirmPassword, emailCode, smsCode } = value;
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Check if codes are valid and not expired
    if (!user.verification_expires_at || new Date() > user.verification_expires_at) {
      return res.status(400).json({ error: 'Verification codes expired' });
    }
    
    if (user.verification_attempts >= 3) {
      return res.status(400).json({ error: 'Too many verification attempts. Request new codes.' });
    }
    
    if (user.email_verification_code !== emailCode) {
      await pool.query('UPDATE users SET verification_attempts = verification_attempts + 1 WHERE email = $1', [email]);
      return res.status(400).json({ error: 'Invalid email verification code' });
    }
    
    if (user.phone && user.sms_verification_code !== smsCode) {
      await pool.query('UPDATE users SET verification_attempts = verification_attempts + 1 WHERE email = $1', [email]);
      return res.status(400).json({ error: 'Invalid SMS verification code' });
    }
    
    // Hash new password and activate account
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE users SET password = $1, password_set = true, email_verification_code = NULL, sms_verification_code = NULL, verification_expires_at = NULL, verification_attempts = 0 WHERE email = $2',
      [hashedPassword, email]
    );
    
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      school_id: user.school_id
    };
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Password setup successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Password setup error:', error);
    res.status(500).json({ error: 'Password setup failed' });
  }
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