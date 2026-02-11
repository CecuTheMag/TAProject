#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import pool from './backend/database.js';
import { createSchoolSchema } from './backend/migrations/schema-per-school.js';

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data...\n');
    
    // 1. Ensure default school exists
    console.log('1️⃣ Ensuring default school exists...');
    let school;
    const existingSchool = await pool.query('SELECT * FROM schools WHERE code = $1', ['BGVHRFDXSE']);
    
    if (existingSchool.rows.length === 0) {
      const schoolResult = await pool.query(
        'INSERT INTO schools (name, code, address, phone) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Demo School', 'BGVHRFDXSE', '123 Demo Street', '+1234567890']
      );
      school = schoolResult.rows[0];
      console.log('✅ Created default school:', school.name);
    } else {
      school = existingSchool.rows[0];
      console.log('✅ Default school exists:', school.name);
    }
    
    // 2. Create school schema if it doesn't exist
    console.log('\\n2️⃣ Creating school schema...');
    try {
      await createSchoolSchema(school.code);
      console.log('✅ School schema created/verified');
    } catch (error) {
      console.log('⚠️ Schema creation error (might already exist):', error.message);
    }
    
    // 3. Create test users in school schema
    console.log('\\n3️⃣ Creating test users...');
    const schemaName = `school_${school.code.toLowerCase()}`;
    
    const testUsers = [
      {
        username: 'admin_test',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        username: 'student_test',
        email: 'student@test.com',
        password: 'student123',
        role: 'student'
      }
    ];
    
    for (const userData of testUsers) {
      try {
        // Check if user exists
        const existingUser = await pool.query(
          `SELECT id FROM "${schemaName}".users WHERE email = $1`,
          [userData.email]
        );
        
        if (existingUser.rows.length === 0) {
          const hashedPassword = await bcrypt.hash(userData.password, 12);
          const result = await pool.query(
            `INSERT INTO "${schemaName}".users (username, email, password, role, password_set) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [userData.username, userData.email, hashedPassword, userData.role, true]
          );
          console.log(`✅ Created user: ${userData.email} (${userData.role}) - ID: ${result.rows[0].id}`);
        } else {
          console.log(`✅ User exists: ${userData.email} (${userData.role}) - ID: ${existingUser.rows[0].id}`);
        }
      } catch (userError) {
        console.log(`❌ Error creating user ${userData.email}:`, userError.message);
      }
    }
    
    console.log('\\n🎉 Test data setup completed!');
    console.log('\\n📋 Test Credentials:');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   Student: student@test.com / student123');
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupTestData();