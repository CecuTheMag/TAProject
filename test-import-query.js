import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'SIMS',
  user: 'postgres',
  password: '1337'
});

async function testImportQuery() {
  try {
    console.log('Testing the exact import query...');
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // This is the exact query from the import
    const result = await pool.query(`
      INSERT INTO users (username, email, password, role, school_id, grade_level, subject_specialization) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      ON CONFLICT (email) DO UPDATE SET 
      username = EXCLUDED.username,
      role = EXCLUDED.role,
      grade_level = EXCLUDED.grade_level,
      subject_specialization = EXCLUDED.subject_specialization
      RETURNING id
    `, ['testuser123', 'test.user@student.hbschool.bg', hashedPassword, 'student', 1, 'Test User', 'Test Role']);
    
    console.log('Import query successful!');
    console.log('Returned rows:', result.rows.length);
    console.log('User ID:', result.rows[0]?.id);
    
    // Check if user exists
    const check = await pool.query('SELECT * FROM users WHERE email = $1', ['test.user@student.hbschool.bg']);
    console.log('User found in database:', check.rows.length > 0);
    if (check.rows.length > 0) {
      console.log('User details:', check.rows[0]);
    }
    
    // Clean up
    await pool.query('DELETE FROM users WHERE email = $1', ['test.user@student.hbschool.bg']);
    console.log('Test user deleted');
    
  } catch (error) {
    console.error('Import query failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
  } finally {
    await pool.end();
  }
}

testImportQuery();