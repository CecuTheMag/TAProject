import axios from 'axios';

async function syncSchool() {
  try {
    console.log('Syncing school from admin database to main database...');
    
    // Update the school in main database to match admin database
    const result = await axios.post('http://localhost:5000/api/internal/query', {
      query: 'UPDATE schools SET name = $1, code = $2 WHERE id = 1',
      params: ['sveti nikola', 'EHTRFRTFED']
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'internal_api_key_secure_2026'
      }
    });
    
    console.log('School updated successfully');
    
    // Verify the update
    const check = await axios.post('http://localhost:5000/api/internal/query', {
      query: 'SELECT id, name, code FROM schools WHERE id = 1',
      params: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'internal_api_key_secure_2026'
      }
    });
    
    console.log('Updated school:', check.data.rows[0]);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

syncSchool();