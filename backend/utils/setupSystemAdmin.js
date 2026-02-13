import pool from '../database.js';
import bcrypt from 'bcryptjs';

const setupSystemAdmin = async () => {
  try {
    console.log('Setting up system admin...');
    
    // Check existing users
    const users = await pool.query('SELECT id, username, email, role FROM users LIMIT 10');
    console.log('Existing users:', users.rows);
    
    // Add is_system_admin column if it doesn't exist
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT false');
    
    // Create or update admin@schoolsync.bg as system admin
    const hashedPassword = await bcrypt.hash('schoolsync2026', 12);
    
    const result = await pool.query(`
      INSERT INTO users (username, email, password, role, is_system_admin) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (email) DO UPDATE SET 
        is_system_admin = true,
        role = 'admin'
      RETURNING id, username, email, role, is_system_admin
    `, ['admin', 'admin@schoolsync.bg', hashedPassword, 'admin', true]);
    
    console.log('✓ System admin created/updated:', result.rows[0]);
    
    console.log('✓ System admin setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
};

setupSystemAdmin();