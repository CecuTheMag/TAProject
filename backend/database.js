import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { createDefaultAdmin } from './utils/createAdmin.js';
import { createSampleData } from './utils/createSampleData.js';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Connection pool optimization
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
  maxUses: 7500, // Close connection after 7500 uses
});

// database initialization
export const initDB = async () => {
  try {
    // users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // equipment table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        serial_number VARCHAR(100) UNIQUE,
        condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'under_repair', 'retired')),
        location VARCHAR(100),
        photo VARCHAR(255),
        qr_code TEXT,
        requires_approval BOOLEAN DEFAULT false,
        quantity INTEGER DEFAULT 1,
        stock_threshold INTEGER DEFAULT 2,
        documents TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add columns if they don't exist
    await pool.query(`
      ALTER TABLE equipment 
      ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS stock_threshold INTEGER DEFAULT 2,
      ADD COLUMN IF NOT EXISTS documents TEXT[]
    `);

    // Update qr_code column to TEXT
    await pool.query(`
      ALTER TABLE equipment 
      ALTER COLUMN qr_code TYPE TEXT
    `).catch(() => {});

    // requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        equipment_id INTEGER REFERENCES equipment(id),
        request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        due_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        returned_at TIMESTAMP,
        return_condition VARCHAR(20) CHECK (return_condition IN ('excellent', 'good', 'fair', 'poor')),
        notes TEXT
      )
    `);

    // Add due_date and reminder_sent columns if they don't exist
    await pool.query(`
      ALTER TABLE requests 
      ADD COLUMN IF NOT EXISTS due_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS reminder_sent TIMESTAMP
    `);

    // Update role constraint to include new roles
    try {
      // Drop any existing role constraints
      await pool.query(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
      `);
      await pool.query(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check1
      `);
      
      // Add the new constraint
      await pool.query(`
        ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('student', 'teacher', 'admin'))
      `);
      
      console.log('Role constraint updated successfully');
    } catch (constraintError) {
      console.log('Role constraint update:', constraintError.message);
    }

    // condition logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS condition_logs (
        id SERIAL PRIMARY KEY,
        equipment_id INTEGER REFERENCES equipment(id),
        user_id INTEGER REFERENCES users(id),
        old_condition VARCHAR(20),
        new_condition VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_requests_equipment_id ON requests(equipment_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_requests_due_date ON requests(due_date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    
    console.log('Database tables and indexes initialized successfully');
    
    // create default admin account
    await createDefaultAdmin();
    
    // create sample data
    await createSampleData();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export default pool;