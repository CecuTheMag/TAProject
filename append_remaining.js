const fs = require('fs');

// Read the remaining students file
const remainingData = fs.readFileSync('remaining_students.csv', 'utf8');
const lines = remainingData.split('\n');

// Find lines starting from grade 8 (line 341 onwards)
const grade8AndAbove = lines.slice(160); // Skip grades 6-7 data

// Append to main CSV
fs.appendFileSync('SCHOOL_DATA.csv', '\n' + grade8AndAbove.join('\n'));

console.log('Added remaining student data for grades 8-12');
console.log('Total lines added:', grade8AndAbove.length);