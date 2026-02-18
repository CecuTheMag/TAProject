-- Migration: 003_multi_tenant_system
-- Description: Add multi-tenant support with system admin and schools
-- Created: 2026-01-15

-- Schools table for multi-tenancy
CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  domain VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add school_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT false;

-- Update existing users to have valid roles
UPDATE users SET role = 'student' WHERE role NOT IN ('student', 'teacher', 'manager', 'admin');

-- Update role constraint to include system_admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'teacher', 'manager', 'admin', 'system_admin'));

-- Add school_id to all relevant tables (only if they exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'equipment') THEN
        ALTER TABLE equipment ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'requests') THEN
        ALTER TABLE requests ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects') THEN
        ALTER TABLE subjects ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id);
        ALTER TABLE subjects ADD COLUMN IF NOT EXISTS code VARCHAR(20);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lesson_plans') THEN
        ALTER TABLE lesson_plans ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id);
    END IF;
END $$;

-- Create indexes for performance (only if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
        CREATE INDEX IF NOT EXISTS idx_users_system_admin ON users(is_system_admin);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'equipment') THEN
        CREATE INDEX IF NOT EXISTS idx_equipment_school_id ON equipment(school_id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'requests') THEN
        CREATE INDEX IF NOT EXISTS idx_requests_school_id ON requests(school_id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects') THEN
        CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
END $$;

-- Insert default system admin (password must be set via application)
INSERT INTO users (username, email, password, role, is_system_admin, created_at) 
VALUES (
  'system_admin', 
  'system@school-sync.org', 
  'MUST_BE_SET_BY_APPLICATION', -- Placeholder - use environment variable in app code
  'system_admin', 
  true, 
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
