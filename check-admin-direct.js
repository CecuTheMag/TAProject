import pkg from 'pg';
const { Pool } = pkg;

const adminPool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'SIMS_ADMIN',
  user: 'admin_user',
  password: 'admin_secure_pass_2026'
});

async function checkAdminDB() {
  try {
    console.log('=== ADMIN DATABASE DIRECT ===');
    
    const schools = await adminPool.query('SELECT id, name, code FROM schools ORDER BY id');
    console.log('Schools in admin database:');
    schools.rows.forEach(school => {
      console.log(`ID ${school.id}: ${school.name} (${school.code})`);
    });
    
    const admins = await adminPool.query('SELECT * FROM admin_users');
    console.log('\nAdmin users:');
    admins.rows.forEach(admin => {
      console.log(`${admin.id}: ${admin.username} (${admin.email})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await adminPool.end();
  }
}

checkAdminDB();