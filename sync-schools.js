#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://admin-backend:3001';
const MAIN_API_URL = process.env.MAIN_API_URL || 'http://backend:5000';
const API_KEY = process.env.MAIN_API_KEY || 'internal_api_key_secure_2026';

async function syncSchools() {
  try {
    console.log('🔄 Starting school synchronization...');
    
    // Get all schools from admin database
    console.log('📋 Fetching schools from admin database...');
    const adminResponse = await axios.get(`${ADMIN_API_URL}/api/system-admin/schools`, {
      headers: {
        'Authorization': 'Bearer admin_token', // You may need to adjust this
        'Content-Type': 'application/json'
      }
    });
    
    const schools = adminResponse.data.schools || [];
    console.log(`Found ${schools.length} schools in admin database`);
    
    for (const school of schools) {
      try {
        console.log(`\n🏫 Processing school: ${school.name} (${school.code})`);
        
        // Sync school to main database
        console.log('  📤 Syncing to main database...');
        await axios.post(`${MAIN_API_URL}/api/internal/query`, {
          query: 'INSERT INTO schools (id, name, code, address, phone) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, address = EXCLUDED.address, phone = EXCLUDED.phone',
          params: [school.id, school.name, school.code, school.address || null, school.phone || null]
        }, {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        });
        console.log('  ✅ School synced to main database');
        
        // Create schema for school
        console.log('  🏗️  Creating school schema...');
        const schemaResponse = await axios.post(`${MAIN_API_URL}/api/internal/create-school-schema`, {
          schoolCode: school.code
        }, {
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        });
        console.log('  ✅ Schema created:', schemaResponse.data.message);
        
      } catch (schoolError) {
        console.error(`  ❌ Error processing school ${school.name}:`, schoolError.response?.data || schoolError.message);
      }
    }
    
    console.log('\n🎉 School synchronization completed!');
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the sync
syncSchools().then(() => {
  console.log('✅ Sync process finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Sync process failed:', error);
  process.exit(1);
});