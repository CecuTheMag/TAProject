import pkg from 'pg';
import bcrypt from 'bcryptjs';
import axios from 'axios';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'SIMS',
  user: 'postgres',
  password: '1337'
});

async function testInternalAPI() {
  try {
    console.log('Testing internal API directly...');
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const response = await axios.post('http://localhost:5000/api/internal/query', {
      query: `INSERT INTO users (username, email, password, role, school_id, grade_level, subject_specialization) 
              VALUES ($1, $2, $3, $4, $5, $6, $7) 
              ON CONFLICT (email) DO UPDATE SET 
              username = EXCLUDED.username,
              role = EXCLUDED.role,
              grade_level = EXCLUDED.grade_level,
              subject_specialization = EXCLUDED.subject_specialization
              RETURNING id`,
      params: ['apitest123', 'api.test@student.hbschool.bg', hashedPassword, 'student', 1, 'API Test User', 'API Test Role']
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'internal_api_key_secure_2025'
      }
    });
    
    console.log('API Response:', response.data);
    
    // Check if user exists in database
    const check = await pool.query('SELECT * FROM users WHERE email = $1', ['api.test@student.hbschool.bg']);
    console.log('User found in database after API call:', check.rows.length > 0);
    
    if (check.rows.length > 0) {
      console.log('User details:', check.rows[0]);
      // Clean up
      await pool.query('DELETE FROM users WHERE email = $1', ['api.test@student.hbschool.bg']);
      console.log('Test user deleted');
    }
    
  } catch (error) {
    console.error('API test failed:', error.response?.data || error.message);
  } finally {
    await pool.end();
  }
}

testInternalAPI();