import fs from 'fs';
import path from 'path';
import pool from '../database.js';

const runMigrations = async () => {
  try {
    console.log('Running multi-tenant migrations...');
    
    // Read and execute migration files
    const migrations = [
      '003_multi_tenant_system.sql',
      '004_school_data.sql'
    ];
    
    for (const migration of migrations) {
      const migrationPath = path.join(process.cwd(), 'migrations', migration);
      if (fs.existsSync(migrationPath)) {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log(`Executing ${migration}...`);
        await pool.query(sql);
        console.log(`✓ ${migration} completed`);
      }
    }
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();