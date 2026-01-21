import bcrypt from 'bcryptjs';
import pool from './database.js';

const createSystemAdmin = async () => {
  const client = await pool.connect();
  try {
    // Create system admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await client.query(`
      INSERT INTO users (username, email, password, role) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        role = EXCLUDED.role
    `, ['systemadmin', 'admin@assetflow.bg', hashedPassword, 'system_admin']);

    console.log('✅ System admin created successfully');
    console.log('📧 Email: admin@assetflow.bg');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('❌ Failed to create system admin:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

createSystemAdmin();