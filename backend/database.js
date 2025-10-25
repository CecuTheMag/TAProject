// SIMS Database Configuration and Initialization
// Handles PostgreSQL connection, table creation, and sample data setup

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { createDefaultAdmin } from './utils/createAdmin.js';
import { createSampleData } from './utils/createSampleData.js';

// Load environment variables
dotenv.config();

/**
 * PostgreSQL Connection Pool Configuration
 * Optimized for high-performance concurrent connections
 */
const pool = new Pool({
  host: process.env.DB_HOST,           // Database server hostname
  port: process.env.DB_PORT,           // Database server port (default: 5432)
  user: process.env.DB_USER,           // Database username
  password: process.env.DB_PASSWORD,   // Database password
  database: process.env.DB_NAME,       // Database name
  
  // Connection pool optimization for enterprise scaling
  max: 20,                    // Maximum number of concurrent connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout for new connections (2 seconds)
  maxUses: 7500,              // Close and recreate connection after 7500 uses
});

/**
 * Database Initialization Function
 * Creates all required tables, indexes, and constraints
 * Sets up sample data and default admin account
 */
export const initDB = async () => {
  try {
    // ===== USERS TABLE =====
    // Stores user accounts with role-based access control
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,                    -- Auto-incrementing user ID
        username VARCHAR(50) UNIQUE NOT NULL,     -- Unique username for login
        email VARCHAR(100) UNIQUE NOT NULL,       -- Unique email address
        password VARCHAR(255) NOT NULL,           -- Hashed password (bcrypt)
        role VARCHAR(20) DEFAULT 'student'        -- User role for permissions
          CHECK (role IN ('student', 'teacher', 'manager', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Account creation date
      )
    `);

    // ===== EQUIPMENT TABLE =====
    // Stores all equipment/inventory items with tracking capabilities
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,                    -- Auto-incrementing equipment ID
        name VARCHAR(100) NOT NULL,               -- Equipment name/title
        type VARCHAR(50) NOT NULL,                -- Category (projector, laptop, etc.)
        serial_number VARCHAR(100) UNIQUE,        -- Unique identifier for tracking
        condition VARCHAR(20) DEFAULT 'good'      -- Physical condition assessment
          CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
        status VARCHAR(20) DEFAULT 'available'    -- Availability status
          CHECK (status IN ('available', 'checked_out', 'under_repair', 'retired')),
        location VARCHAR(100),                    -- Physical storage location
        photo VARCHAR(255),                       -- Image URL for identification
        qr_code TEXT,                            -- QR code for mobile scanning
        requires_approval BOOLEAN DEFAULT false,  -- Admin approval required flag
        quantity INTEGER DEFAULT 1,              -- Stock quantity available
        stock_threshold INTEGER DEFAULT 2,       -- Low stock alert threshold
        documents TEXT[],                        -- Associated document filenames
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation date
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

    // ===== REQUESTS TABLE =====
    // Tracks equipment borrowing requests and approval workflow
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,                    -- Auto-incrementing request ID
        user_id INTEGER REFERENCES users(id),     -- Requesting user
        equipment_id INTEGER REFERENCES equipment(id), -- Requested equipment
        request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When request was made
        start_date TIMESTAMP NOT NULL,            -- Requested start date
        end_date TIMESTAMP NOT NULL,              -- Requested end date
        due_date TIMESTAMP,                       -- Actual due date (after approval)
        status VARCHAR(20) DEFAULT 'pending'      -- Request workflow status
          CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'early_returned')),
        manager_approved_by INTEGER REFERENCES users(id), -- Manager who approved
        manager_approved_at TIMESTAMP,            -- Manager approval timestamp
        approved_by INTEGER REFERENCES users(id), -- Final approver
        approved_at TIMESTAMP,                    -- Final approval timestamp
        returned_at TIMESTAMP,                    -- Equipment return timestamp
        return_condition VARCHAR(20)              -- Condition upon return
          CHECK (return_condition IN ('excellent', 'good', 'fair', 'poor')),
        notes TEXT                               -- Additional notes/comments
      )
    `);

    // Add due_date and reminder_sent columns if they don't exist
    await pool.query(`
      ALTER TABLE requests 
      ADD COLUMN IF NOT EXISTS due_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS reminder_sent TIMESTAMP,
      ADD COLUMN IF NOT EXISTS manager_approved_by INTEGER REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS manager_approved_at TIMESTAMP
    `);

    // Update status constraint to include early_returned
    try {
      await pool.query(`
        ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_status_check
      `);
      await pool.query(`
        ALTER TABLE requests ADD CONSTRAINT requests_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'early_returned'))
      `);
    } catch (constraintError) {
      console.log('Status constraint update:', constraintError.message);
    }

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
        CHECK (role IN ('student', 'teacher', 'manager', 'admin'))
      `);
      
      console.log('Role constraint updated successfully');
    } catch (constraintError) {
      console.log('Role constraint update:', constraintError.message);
    }

    // ===== CONDITION LOGS TABLE =====
    // Audit trail for equipment condition changes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS condition_logs (
        id SERIAL PRIMARY KEY,                    -- Auto-incrementing log ID
        equipment_id INTEGER REFERENCES equipment(id), -- Equipment being logged
        user_id INTEGER REFERENCES users(id),     -- User making the change
        old_condition VARCHAR(20),                -- Previous condition
        new_condition VARCHAR(20),                -- New condition
        notes TEXT,                              -- Reason for condition change
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Log entry timestamp
      )
    `);



    // ===== PERFORMANCE INDEXES =====
    // Optimize database queries for high-traffic operations
    await pool.query('CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id)');         // User's request history
    await pool.query('CREATE INDEX IF NOT EXISTS idx_requests_equipment_id ON requests(equipment_id)'); // Equipment usage tracking
    await pool.query('CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)');           // Filter by request status
    await pool.query('CREATE INDEX IF NOT EXISTS idx_requests_due_date ON requests(due_date)');       // Overdue equipment alerts
    await pool.query('CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status)');         // Available equipment queries
    await pool.query('CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(type)');             // Equipment category filtering
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');                    // Role-based access control
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');                  // Login authentication

    
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