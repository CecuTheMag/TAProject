import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'SIMS',
  user: 'postgres',
  password: '1337'
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT COUNT(*) as total, school_id FROM users GROUP BY school_id ORDER BY school_id');
    console.log('Users by school_id:');
    result.rows.forEach(row => {
      console.log(`School ${row.school_id}: ${row.total} users`);
    });
    
    const school1Users = await pool.query('SELECT id, username, email, role, school_id FROM users WHERE school_id = 1 LIMIT 10');
    console.log('\nFirst 10 users in school 1:');
    school1Users.rows.forEach(user => {
      console.log(`${user.id}: ${user.username} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();