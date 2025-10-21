import fs from 'fs';
import path from 'path';
import pool from '../database.js';

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(process.cwd(), 'migrations');
  }

  async createMigrationsTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations() {
    const result = await pool.query('SELECT filename FROM migrations ORDER BY filename');
    return result.rows.map(row => row.filename);
  }

  async runMigrations() {
    await this.createMigrationsTable();
    
    const executedMigrations = await this.getExecutedMigrations();
    const migrationFiles = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`Running migration: ${file}`);
        const migrationSQL = fs.readFileSync(path.join(this.migrationsPath, file), 'utf8');
        
        try {
          await pool.query(migrationSQL);
          await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
          console.log(`✅ Migration ${file} completed`);
        } catch (error) {
          console.error(`❌ Migration ${file} failed:`, error);
          throw error;
        }
      }
    }
  }
}

export default new MigrationRunner();