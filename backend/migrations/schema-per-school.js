import pool from '../database.js';

const createSchoolSchema = async (schoolCode) => {
  const client = await pool.connect();
  try {
    // Create schema for school
    await client.query(`CREATE SCHEMA IF NOT EXISTS "school_${schoolCode}"`);
    
    // Create all tables in school schema
    const tables = [
      `CREATE TABLE IF NOT EXISTS "school_${schoolCode}".users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student',
        grade_level VARCHAR(20),
        subject_specialization VARCHAR(100),
        responsibility_score INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        phone VARCHAR(20),
        password_set BOOLEAN DEFAULT false,
        email_verification_code VARCHAR(6),
        sms_verification_code VARCHAR(6),
        verification_expires_at TIMESTAMP,
        verification_attempts INTEGER DEFAULT 0,
        subject_id INTEGER,
        CONSTRAINT users_role_check CHECK (role IN ('student', 'teacher', 'manager', 'admin', 'system_admin'))
      )`,
      
      `CREATE TABLE IF NOT EXISTS "school_${schoolCode}".subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        grade_level VARCHAR(20),
        room VARCHAR(50),
        equipment_fleets TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS "school_${schoolCode}".equipment (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'available',
        condition_status VARCHAR(50) DEFAULT 'good',
        serial_number VARCHAR(100),
        purchase_date DATE,
        purchase_price DECIMAL(10,2),
        location VARCHAR(200),
        qr_code VARCHAR(255),
        image_url VARCHAR(500),
        learning_impact_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS "school_${schoolCode}".requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "school_${schoolCode}".users(id),
        equipment_id INTEGER REFERENCES "school_${schoolCode}".equipment(id),
        status VARCHAR(50) DEFAULT 'pending',
        request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        start_date DATE,
        end_date DATE,
        due_date TIMESTAMP,
        approved_by INTEGER REFERENCES "school_${schoolCode}".users(id),
        manager_approved_by INTEGER REFERENCES "school_${schoolCode}".users(id),
        approval_date TIMESTAMP,
        approved_at TIMESTAMP,
        return_date TIMESTAMP,
        notes TEXT,
        reminder_sent TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS "school_${schoolCode}".lesson_plans (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES "school_${schoolCode}".users(id),
        subject_id INTEGER REFERENCES "school_${schoolCode}".subjects(id),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        learning_objectives TEXT,
        required_equipment TEXT[],
        lesson_date DATE,
        duration_minutes INTEGER,
        grade_level VARCHAR(20),
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS "school_${schoolCode}".condition_logs (
        id SERIAL PRIMARY KEY,
        equipment_id INTEGER REFERENCES "school_${schoolCode}".equipment(id),
        user_id INTEGER REFERENCES "school_${schoolCode}".users(id),
        condition_before VARCHAR(50),
        condition_after VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS "school_${schoolCode}".equipment_usage_analytics (
        id SERIAL PRIMARY KEY,
        equipment_id INTEGER REFERENCES "school_${schoolCode}".equipment(id),
        user_id INTEGER REFERENCES "school_${schoolCode}".users(id),
        usage_date DATE,
        usage_duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const tableSQL of tables) {
      await client.query(tableSQL);
    }

    // Create indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_${schoolCode}_users_email ON "school_${schoolCode}".users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_${schoolCode}_users_role ON "school_${schoolCode}".users(role)`,
      `CREATE INDEX IF NOT EXISTS idx_${schoolCode}_equipment_status ON "school_${schoolCode}".equipment(status)`,
      `CREATE INDEX IF NOT EXISTS idx_${schoolCode}_requests_status ON "school_${schoolCode}".requests(status)`,
      `CREATE INDEX IF NOT EXISTS idx_${schoolCode}_requests_user ON "school_${schoolCode}".requests(user_id)`
    ];

    for (const indexSQL of indexes) {
      await client.query(indexSQL);
    }

    console.log(`✅ Schema created for school: ${schoolCode}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create schema for ${schoolCode}:`, error);
    return false;
  } finally {
    client.release();
  }
};

const migrateExistingData = async () => {
  const client = await pool.connect();
  try {
    // Get all schools
    const schools = await client.query('SELECT id, code FROM schools');
    
    for (const school of schools.rows) {
      await createSchoolSchema(school.code);
      
      // Migrate users (exclude system admins from school schemas)
      const users = await client.query('SELECT * FROM users WHERE school_id = $1 AND role != $2', [school.id, 'system_admin']);
      for (const user of users.rows) {
        const { school_id, is_system_admin, ...userData } = user;
        const columns = Object.keys(userData).join(', ');
        const values = Object.values(userData);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        await client.query(
          `INSERT INTO "school_${school.code}".users (${columns}) VALUES (${placeholders}) ON CONFLICT (email) DO NOTHING`,
          values
        );
      }
      
      // Migrate equipment
      const equipment = await client.query('SELECT * FROM equipment WHERE school_id = $1', [school.id]);
      for (const item of equipment.rows) {
        const { school_id, ...equipData } = item;
        const columns = Object.keys(equipData).join(', ');
        const values = Object.values(equipData);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        await client.query(
          `INSERT INTO "school_${school.code}".equipment (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
      }
      
      console.log(`✅ Migrated data for school: ${school.code}`);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
  }
};

export { createSchoolSchema, migrateExistingData };