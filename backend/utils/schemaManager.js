import pool from '../database.js';

/**
 * Schema Manager - Multi-tenant isolation using PostgreSQL schemas
 * Each school gets its own schema with complete data separation
 */

export const createSchoolSchema = async (schoolCode) => {
  // SECURITY: Validate schoolCode to prevent SQL injection
  if (!schoolCode || typeof schoolCode !== 'string') {
    throw new Error('Invalid school code: must be a non-empty string');
  }
  
  // Only allow alphanumeric characters, 2-50 chars
  if (!/^[a-zA-Z0-9]{2,50}$/.test(schoolCode)) {
    throw new Error('Invalid school code format: must be alphanumeric, 2-50 characters');
  }
  
  const schemaName = `school_${schoolCode.toLowerCase()}`;
  
  try {
    // Create schema with quoted identifier to prevent injection
    await pool.query('CREATE SCHEMA IF NOT EXISTS "' + schemaName + '"');
    
    // Create all tables in the school schema with quoted identifiers
    await pool.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS "${schemaName}".users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'manager', 'admin')),
        grade_level VARCHAR(20),
        subject_id INTEGER,
        subject_specialization VARCHAR(100),
        responsibility_score INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Subjects table
      CREATE TABLE IF NOT EXISTS "${schemaName}".subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE,
        description TEXT,
        grade_level VARCHAR(20),
        room VARCHAR(50),
        teacher_name VARCHAR(100),
        equipment_fleets TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Equipment table
      CREATE TABLE IF NOT EXISTS "${schemaName}".equipment (
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
        description TEXT,
        educational_subjects TEXT[],
        learning_impact_score DECIMAL(3,2) DEFAULT 0,
        usage_analytics JSONB,
        maintenance_schedule JSONB,
        shareable_district BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Requests table
      CREATE TABLE IF NOT EXISTS "${schemaName}".requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "${schemaName}".users(id),
        equipment_id INTEGER REFERENCES "${schemaName}".equipment(id),
        request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        due_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'early_returned')),
        manager_approved_by INTEGER REFERENCES "${schemaName}".users(id),
        manager_approved_at TIMESTAMP,
        approved_by INTEGER REFERENCES "${schemaName}".users(id),
        approved_at TIMESTAMP,
        returned_at TIMESTAMP,
        return_condition VARCHAR(20) CHECK (return_condition IN ('excellent', 'good', 'fair', 'poor')),
        notes TEXT,
        reminder_sent TIMESTAMP
      );

      -- Lesson plans table
      CREATE TABLE IF NOT EXISTS "${schemaName}".lesson_plans (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES "${schemaName}".users(id),
        subject_id INTEGER REFERENCES "${schemaName}".subjects(id),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        learning_objectives TEXT[],
        required_equipment TEXT[],
        suggested_equipment TEXT[],
        lesson_date DATE,
        start_date DATE,
        end_date DATE,
        duration_minutes INTEGER,
        grade_level VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Condition logs table
      CREATE TABLE IF NOT EXISTS "${schemaName}".condition_logs (
        id SERIAL PRIMARY KEY,
        equipment_id INTEGER REFERENCES "${schemaName}".equipment(id),
        user_id INTEGER REFERENCES "${schemaName}".users(id),
        old_condition VARCHAR(20),
        new_condition VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes with quoted schema names
      CREATE INDEX IF NOT EXISTS "idx_${schemaName}_requests_user" ON "${schemaName}".requests(user_id);
      CREATE INDEX IF NOT EXISTS "idx_${schemaName}_requests_equipment" ON "${schemaName}".requests(equipment_id);
      CREATE INDEX IF NOT EXISTS "idx_${schemaName}_requests_status" ON "${schemaName}".requests(status);
      CREATE INDEX IF NOT EXISTS "idx_${schemaName}_equipment_status" ON "${schemaName}".equipment(status);
      CREATE INDEX IF NOT EXISTS "idx_${schemaName}_users_role" ON "${schemaName}".users(role);
    `);

    console.log(`✅ Schema created for school: ${schemaName}`);
    return schemaName;
  } catch (error) {
    console.error(`❌ Failed to create schema for ${schoolCode}:`, error);
    throw error;
  }
};

export const deleteSchoolSchema = async (schoolCode) => {
  // SECURITY: Validate schoolCode to prevent SQL injection
  if (!schoolCode || typeof schoolCode !== 'string') {
    throw new Error('Invalid school code: must be a non-empty string');
  }
  
  if (!/^[a-zA-Z0-9]{2,50}$/.test(schoolCode)) {
    throw new Error('Invalid school code format: must be alphanumeric, 2-50 characters');
  }
  
  const schemaName = `school_${schoolCode.toLowerCase()}`;
  
  try {
    await pool.query('DROP SCHEMA IF EXISTS "' + schemaName + '" CASCADE');
    console.log(`✅ Schema deleted: ${schemaName}`);
  } catch (error) {
    console.error(`❌ Failed to delete schema ${schemaName}:`, error);
    throw error;
  }
};

export const getSchemaConnection = (schoolCode) => {
  // SECURITY: Validate schoolCode to prevent SQL injection
  if (!schoolCode || typeof schoolCode !== 'string') {
    throw new Error('Invalid school code: must be a non-empty string');
  }
  
  if (!/^[a-zA-Z0-9]{2,50}$/.test(schoolCode)) {
    throw new Error('Invalid school code format: must be alphanumeric, 2-50 characters');
  }
  
  const schemaName = `school_${schoolCode.toLowerCase()}`;
  return {
    query: async (text, params) => {
      // Set search_path to school schema for this query with quoted identifier
      const client = await pool.connect();
      try {
        await client.query('SET search_path TO "' + schemaName + '", public');
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    }
  };
};
