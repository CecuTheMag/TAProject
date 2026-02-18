import pool from '../database.js';

const testLogin = async () => {
  try {
    // Check what the database actually has
    const dbUser = await pool.query('SELECT * FROM users WHERE email = $1', [process.env.DEFAULT_ADMIN_EMAIL]);
    console.log('Database user:', dbUser.rows[0]);
    
    // Test what the login query returns
    const loginQuery = await pool.query('SELECT * FROM users WHERE email = $1', [process.env.DEFAULT_ADMIN_EMAIL]);
    console.log('Login query result:', loginQuery.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();
