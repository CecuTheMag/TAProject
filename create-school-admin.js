import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'SIMS',
  user: 'postgres',
  password: '1337'
});

async function createSchoolAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role, school_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      ['schooladmin1', 'schooladmin1@test.com', hashedPassword, 'admin', 1]
    );
    
    console.log('School admin created successfully:', result.rows[0]);
    console.log('Login credentials:');
    console.log('Email: schooladmin1@test.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating school admin:', error);
  } finally {
    await pool.end();
  }
}

createSchoolAdmin();