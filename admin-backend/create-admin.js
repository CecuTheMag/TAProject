import bcrypt from 'bcryptjs';
import pool from './database.js';

const createSystemAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await pool.query(`
      INSERT INTO admin_users (username, email, password)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING
    `, ['systemadmin', 'admin@system.com', hashedPassword]);
    
    console.log('✅ System admin created');
    console.log('Email: admin@system.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create system admin:', error);
    process.exit(1);
  }
};

createSystemAdmin();
