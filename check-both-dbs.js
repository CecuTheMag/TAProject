import axios from 'axios';

async function checkBothDatabases() {
  try {
    console.log('=== MAIN DATABASE (Docker) ===');
    
    // Check schools in main database
    const mainSchools = await axios.post('http://localhost:5000/api/internal/query', {
      query: 'SELECT id, name, code FROM schools ORDER BY id',
      params: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'internal_api_key_secure_2025'
      }
    });
    
    console.log('Schools in main database:');
    mainSchools.data.rows.forEach(school => {
      console.log(`ID ${school.id}: ${school.name} (${school.code})`);
    });
    
    // Check users by school_id in main database
    const mainUsers = await axios.post('http://localhost:5000/api/internal/query', {
      query: 'SELECT school_id, COUNT(*) as count FROM users GROUP BY school_id ORDER BY school_id',
      params: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'internal_api_key_secure_2025'
      }
    });
    
    console.log('\nUsers by school_id in main database:');
    mainUsers.data.rows.forEach(row => {
      console.log(`School ${row.school_id}: ${row.count} users`);
    });
    
    console.log('\n=== ADMIN DATABASE ===');
    
    // Check admin panel schools
    const adminResponse = await axios.get('http://localhost:5005/api/system-admin/schools', {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'your_admin_token_here'}`
      }
    });
    
    console.log('Schools in admin database:');
    if (adminResponse.data.schools) {
      adminResponse.data.schools.forEach(school => {
        console.log(`ID ${school.id}: ${school.name} (${school.code}) - ${school.user_count} users`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkBothDatabases();