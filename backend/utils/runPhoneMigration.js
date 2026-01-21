import fs from 'fs';
import path from 'path';
import pool from '../database.js';

const runMigration = async (migrationFile) => {
  try {
    const migrationPath = path.join(process.cwd(), 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`Running migration: ${migrationFile}`);
    await pool.query(migrationSQL);
    console.log(`✅ Migration ${migrationFile} completed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${migrationFile} failed:`, error.message);
    throw error;
  }
};

// Run the phone column migration
runMigration('008_add_phone_column.sql')
  .then(() => {
    console.log('Phone column migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });