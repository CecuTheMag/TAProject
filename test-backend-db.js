import axios from 'axios';

async function testBackendDB() {
  try {
    console.log('Testing what database the backend is connected to...');
    
    const response = await axios.post('http://localhost:5000/api/internal/query', {
      query: 'SELECT current_database(), current_user, inet_server_addr(), inet_server_port()',
      params: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'internal_api_key_secure_2025'
      }
    });
    
    console.log('Backend database info:', response.data.rows[0]);
    
    // Check user count
    const userCount = await axios.post('http://localhost:5000/api/internal/query', {
      query: 'SELECT COUNT(*) as total FROM users',
      params: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'internal_api_key_secure_2025'
      }
    });
    
    console.log('Users in backend database:', userCount.data.rows[0]);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testBackendDB();