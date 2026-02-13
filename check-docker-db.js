import axios from 'axios';

async function checkDockerDB() {
  try {
    // Check users by school_id
    const usersBySchool = await axios.post('http://localhost:5000/api/internal/query', {
      query: 'SELECT school_id, COUNT(*) as total FROM users GROUP BY school_id ORDER BY school_id',
      params: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'internal_api_key_secure_2026'
      }
    });
    
    console.log('Users by school_id in Docker database:');
    usersBySchool.data.rows.forEach(row => {
      console.log(`School ${row.school_id}: ${row.total} users`);
    });
    
    // Check admin users
    const admins = await axios.post('http://localhost:5000/api/internal/query', {
      query: 'SELECT id, username, email, role, school_id FROM users WHERE role = \'admin\' ORDER BY id',
      params: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'internal_api_key_secure_2026'
      }
    });
    
    console.log('\nAdmin users in Docker database:');
    admins.data.rows.forEach(admin => {
      console.log(`${admin.id}: ${admin.username} (${admin.email}) - school_${admin.school_id}`);
    });
    
    // Check sample users from school 1
    const school1Users = await axios.post('http://localhost:5000/api/internal/query', {
      query: 'SELECT id, username, email, role, school_id FROM users WHERE school_id = 1 LIMIT 10',
      params: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'internal_api_key_secure_2026'
      }
    });
    
    console.log('\nFirst 10 users in school 1:');
    school1Users.data.rows.forEach(user => {
      console.log(`${user.id}: ${user.username} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkDockerDB();