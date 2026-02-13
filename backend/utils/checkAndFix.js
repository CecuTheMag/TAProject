import pool from '../database.js';

const checkAndFix = async () => {
  try {
    // Check current admin user
    const admin = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@schoolsync.bg']);
    console.log('Current admin user:', admin.rows[0]);
    
    // Force update the admin user
    const result = await pool.query(`
      UPDATE users 
      SET is_system_admin = true 
      WHERE email = 'admin@schoolsync.bg'
      RETURNING *
    `);
    
    console.log('Updated admin user:', result.rows[0]);
    
    // Test login response
    const loginTest = await pool.query('SELECT id, username, email, role, is_system_admin FROM users WHERE email = $1', ['admin@schoolsync.bg']);
    console.log('Login would return:', loginTest.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkAndFix();