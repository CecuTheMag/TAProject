import pool from '../database.js';

const updateExistingAdmin = async () => {
  try {
    console.log('Updating existing admin to system admin...');
    
    // Add is_system_admin column if it doesn't exist
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT false');
    
    // Update existing admin@schoolsync.bg to be system admin
    const result = await pool.query(`
      UPDATE users 
      SET is_system_admin = true 
      WHERE email = 'admin@schoolsync.bg'
      RETURNING id, username, email, role, is_system_admin
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Updated admin account:', result.rows[0]);
    } else {
      console.log('Admin account not found');
    }
    
    // Create schools table for future use
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✓ System admin setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }
};

updateExistingAdmin();