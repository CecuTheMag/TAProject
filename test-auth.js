#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';
import pool from './database.js';

// Load environment variables
dotenv.config();

const API_URL = 'http://localhost:5000';

async function testAuth() {
  try {
    console.log('🧪 Testing authentication and database setup...\n');
    
    // 1. Check database connection
    console.log('1️⃣ Testing database connection...');
    const dbTest = await pool.query('SELECT COUNT(*) FROM schools');
    console.log(`✅ Database connected. Found ${dbTest.rows[0].count} schools\n`);
    
    // 2. List all schools
    console.log('2️⃣ Listing all schools...');
    const schools = await pool.query('SELECT id, name, code FROM schools');
    schools.rows.forEach(school => {
      console.log(`   🏫 ${school.name} (${school.code}) - ID: ${school.id}`);
    });
    console.log('');
    
    // 3. Check school schemas and users
    console.log('3️⃣ Checking school schemas and users...');
    for (const school of schools.rows) {
      try {
        const userCount = await pool.query(`SELECT COUNT(*) FROM "school_${school.code.toLowerCase()}".users`);
        const adminCount = await pool.query(`SELECT COUNT(*) FROM "school_${school.code.toLowerCase()}".users WHERE role = 'admin'`);
        console.log(`   📊 ${school.code}: ${userCount.rows[0].count} users, ${adminCount.rows[0].count} admins`);
        
        // List first few users
        const users = await pool.query(`SELECT id, username, email, role FROM "school_${school.code.toLowerCase()}".users LIMIT 3`);
        users.rows.forEach(user => {
          console.log(`      👤 ${user.username} (${user.email}) - ${user.role}`);
        });
      } catch (schemaError) {
        console.log(`   ❌ Schema school_${school.code.toLowerCase()} not found`);
      }
    }
    console.log('');
    
    // 4. Test API endpoints
    console.log('4️⃣ Testing API endpoints...');
    
    // Test auth endpoint
    try {
      const authTest = await axios.get(`${API_URL}/api/auth/test-db`);
      console.log('✅ Auth endpoint accessible');
    } catch (error) {
      console.log('❌ Auth endpoint error:', error.response?.status || error.message);
    }
    
    // Test dashboard endpoint without auth
    try {
      const dashTest = await axios.get(`${API_URL}/api/dashboard/test`);
      console.log('✅ Dashboard test endpoint accessible');
    } catch (error) {
      console.log('❌ Dashboard test endpoint error:', error.response?.status || error.message);
    }
    
    console.log('\\n🎉 Test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the test
testAuth();