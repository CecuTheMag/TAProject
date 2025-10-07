import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { createDefaultAdmin } from './utils/createAdmin.js';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
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
        qr_code VARCHAR(255),
        requires_approval BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        equipment_id INTEGER REFERENCES equipment(id),
        request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        returned_at TIMESTAMP,
        return_condition VARCHAR(20) CHECK (return_condition IN ('excellent', 'good', 'fair', 'poor')),
        notes TEXT
      )
    `);

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

    console.log('Database tables initialized successfully');
    
    // create default admin account
    await createDefaultAdmin();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export default pool;