import bcrypt from 'bcryptjs';
import pool from '../database.js';

export const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await pool.query('SELECT * FROM users WHERE email = $1', ['sims@tech.academy']);
    
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('starazagora', 12);
      
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'sims@tech.academy', hashedPassword, 'admin']
      );
      
      console.log('✅ Default admin account created: sims@tech.academy');
    } else {
      console.log('ℹ️  Default admin account already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};