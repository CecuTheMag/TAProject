-- Migration: 006_system_admin_proper
-- Description: Add system admin functionality properly
-- Created: 2026-01-15

-- First, add the new columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT false;

-- Update the role constraint to include system_admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'teacher', 'manager', 'admin', 'system_admin'));

-- Create schools table if it doesn't exist (it might already exist from database.js)
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

-- Add school_id foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_school_id_fkey'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_school_id_fkey 
        FOREIGN KEY (school_id) REFERENCES schools(id);
    END IF;
END $$;

-- Insert system admin if it doesn't exist
INSERT INTO users (username, email, password, role, is_system_admin, created_at) 
VALUES (
  'system_admin', 
  'system@assetflow.bg', 
  '$2b$12$LQv3c1yqBwEHXw47HvzOWOehHdBNppveYuwz4JSHGoP8CoJxlrn3.', -- password: systemadmin123
  'system_admin', 
  true, 
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET 
  role = 'system_admin',
  is_system_admin = true;

-- Create school_data table for authentication validation
CREATE TABLE IF NOT EXISTS school_data (
  id INTEGER PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

-- Insert sample school data
INSERT INTO school_data (id, name, phone, role, email) VALUES
(1, 'Maria Petrova', '0888123456', 'MATHEMATICS', 'maria.petrova@hbschool.bg'),
(2, 'Ivan Georgiev', '0889234567', 'MATHEMATICS', 'ivan.georgiev@hbschool.bg'),
(35, 'Director Ivan Stoyanov', '0885567890', 'ADMINISTRATOR', 'director@hbschool.bg'),
(101, 'Petya Petkova', '088565001', '5A', 'petya.petkova.5a@student.hbschool.bg'),
(102, 'Boris Georgiev', '088565002', '5A', 'boris.georgiev.5a@student.hbschool.bg')
ON CONFLICT (email) DO NOTHING;