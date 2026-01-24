import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'SIMS',
  user: 'postgres',
  password: '1337'
});

async function checkSchema() {
  try {
    // Check users table schema
    const schema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table schema:');
    schema.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) default: ${col.column_default}`);
    });
    
    // Test simple insert
    console.log('\nTesting simple insert...');
    try {
      const result = await pool.query(`
        INSERT INTO users (username, email, password, role, school_id, grade_level, subject_specialization) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id
      `, ['testuser', 'test@test.com', 'hashedpass', 'student', 1, 'Test User', 'Test Role']);
      
      console.log('Insert successful, user ID:', result.rows[0].id);
      
      // Clean up
      await pool.query('DELETE FROM users WHERE username = $1', ['testuser']);
      console.log('Test user deleted');
      
    } catch (insertError) {
      console.log('Insert failed:', insertError.message);
      console.log('Error code:', insertError.code);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();