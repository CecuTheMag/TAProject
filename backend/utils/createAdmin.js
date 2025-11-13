import bcrypt from 'bcryptjs';
import pool from '../database.js';

export const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@assetflow.bg']);
    
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('assetflow2024', 12);
      
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@assetflow.bg', hashedPassword, 'admin']
      );
      
      console.log('✅ Default admin account created: admin@assetflow.bg');
    } else {
      console.log('ℹ️  Default admin account already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};