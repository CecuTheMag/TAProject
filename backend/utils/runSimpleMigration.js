import pool from '../database.js';

const runSimpleMigration = async () => {
  try {
    console.log('Running simple multi-tenant migration...');
    
    // Add columns to users table
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS school_id INTEGER');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT false');
    
    // Update existing users
    await pool.query("UPDATE users SET role = 'student' WHERE role NOT IN ('student', 'teacher', 'manager', 'admin')");
    
    // Update role constraint
    await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await pool.query("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'teacher', 'manager', 'admin', 'system_admin'))");
    
    // Create schools table
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
    
    // Insert system admin
    await pool.query(`
      INSERT INTO users (username, email, password, role, is_system_admin) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (email) DO NOTHING
    `, [
      'system_admin',
      'system@schoolsync.bg', 
      '$2b$12$LQv3c1yqBwEHXw47HvzOWOehHdBNppveYuwz4JSHGoP8CoJxlrn3.',
      'system_admin',
      true
    ]);
    
    console.log('✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

runSimpleMigration();