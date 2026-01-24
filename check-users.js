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
    // Check schools first
    const schools = await pool.query('SELECT * FROM schools ORDER BY id');
    console.log('Schools in database:');
    schools.rows.forEach(school => {
      console.log(`ID ${school.id}: ${school.name} (${school.code})`);
    });
    
    // Check total users
    const totalUsers = await pool.query('SELECT COUNT(*) as total FROM users');
    console.log(`\nTotal users in database: ${totalUsers.rows[0].total}`);
    
    // Check users by school_id
    const result = await pool.query('SELECT COUNT(*) as total, school_id FROM users GROUP BY school_id ORDER BY school_id');
    console.log('\nUsers by school_id:');
    result.rows.forEach(row => {
      console.log(`School ${row.school_id}: ${row.total} users`);
    });
    
    // Check for specific email pattern from import
    const importedUsers = await pool.query("SELECT COUNT(*) as total FROM users WHERE email LIKE '%@student.hbschool.bg'");
    console.log(`\nUsers with hbschool.bg emails: ${importedUsers.rows[0].total}`);
    
    // Show sample users
    const sampleUsers = await pool.query('SELECT id, username, email, role, school_id FROM users LIMIT 10');
    console.log('\nSample users:');
    sampleUsers.rows.forEach(user => {
      console.log(`${user.id}: ${user.username} (${user.email}) - ${user.role} - school_${user.school_id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();