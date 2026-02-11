#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_URL = process.env.MAIN_API_URL || 'http://localhost:5000';

async function testDashboard() {
  try {
    console.log('🧪 Testing dashboard statistics...');
    
    // Test without authentication first
    console.log('\n📊 Testing dashboard stats endpoint...');
    
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/test`, {
        headers: {
          'X-School-Code': 'BGVHRFDXSE'
        }
      });
      console.log('✅ Dashboard endpoint accessible:', response.data);
    } catch (error) {
      console.log('❌ Dashboard endpoint error:', error.response?.data || error.message);
    }
    
    // Test school context
    console.log('\n🏫 Testing school context...');
    
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/test-school?school=BGVHRFDXSE`);
      console.log('✅ School context working:', response.data);
    } catch (error) {
      console.log('❌ School context error:', error.response?.data || error.message);
    }
    
    // Test with authentication (you'll need a valid token)
    console.log('\n🔐 Testing with authentication...');
    console.log('Note: You need to login first to get a valid token for this test');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
testDashboard().then(() => {
  console.log('✅ Test completed');
}).catch(error => {
  console.error('💥 Test failed:', error);
});