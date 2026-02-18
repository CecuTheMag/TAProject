#!/usr/bin/env node

/**
 * Verification script to compare ACCDB data with main CSV file
 * This ensures the ACCDB import contains the same data as the reference CSV
 */

import fs from 'fs';
import path from 'path';

const MAIN_CSV_PATH = '/mnt/shared/SchoolSync/SCHOOL_DATA.csv';
const ACCDB_CSV_PATH = '/mnt/shared/SchoolSync/admin-backend/uploads/import_1770317333737_DEMO.accdb.csv';

function parseMainCSV() {
  const content = fs.readFileSync(MAIN_CSV_PATH, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const users = [];
  for (const line of lines) {
    const [id, name, phone, role, email] = line.split(',');
    if (id && name && email) {
      users.push({
        id: parseInt(id),
        name: name.trim(),
        phone: phone.trim(),
        role: role.trim(),
        email: email.trim()
      });
    }
  }
  return users;
}

function parseAccdbCSV() {
  const content = fs.readFileSync(ACCDB_CSV_PATH, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header line
  const users = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',').map(part => part.replace(/"/g, '').trim());
    
    if (parts.length >= 5) {
      const [name, phone, role, email, id] = parts;
      if (id && name && email) {
        users.push({
          id: parseInt(id),
          name: name.trim(),
          phone: phone.trim(),
          role: role.trim(),
          email: email.trim()
        });
      }
    }
  }
  return users;
}

function compareData() {
  console.log('🔍 Comparing ACCDB data with main CSV file...\n');
  
  const mainUsers = parseMainCSV();
  const accdbUsers = parseAccdbCSV();
  
  console.log(`📊 Main CSV: ${mainUsers.length} users`);
  console.log(`📊 ACCDB CSV: ${accdbUsers.length} users\n`);
  
  // Create maps for easier comparison
  const mainMap = new Map(mainUsers.map(u => [u.id, u]));
  const accdbMap = new Map(accdbUsers.map(u => [u.id, u]));
  
  let matches = 0;
  let differences = 0;
  let teachers = 0;
  let students = 0;
  let admins = 0;
  
  const teacherSubjects = [
    'MATHEMATICS', 'BULGARIAN', 'ENGLISH', 'HISTORY', 'GEOGRAPHY', 
    'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'PHYSICAL_EDUCATION', 'ART', 
    'MUSIC', 'TECHNOLOGY', 'COMPUTER_SCIENCE', 'GERMAN', 'FRENCH', 
    'PHILOSOPHY', 'PSYCHOLOGY'
  ];
  
  // Check each user in main CSV
  for (const mainUser of mainUsers) {
    const accdbUser = accdbMap.get(mainUser.id);
    
    if (!accdbUser) {
      console.log(`❌ Missing in ACCDB: ID ${mainUser.id} - ${mainUser.name}`);
      differences++;
      continue;
    }
    
    // Compare data
    if (mainUser.name === accdbUser.name && 
        mainUser.email === accdbUser.email && 
        mainUser.role === accdbUser.role) {
      matches++;
      
      // Count user types
      if (teacherSubjects.includes(mainUser.role.toUpperCase())) {
        teachers++;
      } else if (mainUser.role.toUpperCase() === 'ADMINISTRATOR') {
        admins++;
      } else {
        students++;
      }
    } else {
      console.log(`❌ Data mismatch for ID ${mainUser.id}:`);
      console.log(`   Main: ${mainUser.name} | ${mainUser.role} | ${mainUser.email}`);
      console.log(`   ACCDB: ${accdbUser.name} | ${accdbUser.role} | ${accdbUser.email}`);
      differences++;
    }
  }
  
  // Check for extra users in ACCDB
  for (const accdbUser of accdbUsers) {
    if (!mainMap.has(accdbUser.id)) {
      console.log(`❌ Extra in ACCDB: ID ${accdbUser.id} - ${accdbUser.name}`);
      differences++;
    }
  }
  
  console.log(`\n📈 Results:`);
  console.log(`✅ Matches: ${matches}`);
  console.log(`❌ Differences: ${differences}`);
  console.log(`\n👥 User breakdown:`);
  console.log(`👨‍🏫 Teachers: ${teachers}`);
  console.log(`👨‍🎓 Students: ${students}`);
  console.log(`👨‍💼 Admins: ${admins}`);
  
  if (differences === 0) {
    console.log(`\n🎉 SUCCESS: ACCDB data matches main CSV perfectly!`);
  } else {
    console.log(`\n⚠️  WARNING: Found ${differences} differences between files.`);
  }
  
  return differences === 0;
}

// Run the comparison
try {
  const success = compareData();
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error('❌ Error during comparison:', error.message);
  process.exit(1);
}