-- Simple multi-tenant migration
-- Add essential columns for system admin functionality

-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS school_id INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT false;

-- Update existing users to have valid roles
UPDATE users SET role = 'student' WHERE role NOT IN ('student', 'teacher', 'manager', 'admin');

-- Update role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'teacher', 'manager', 'admin', 'system_admin'));

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system admin
INSERT INTO users (username, email, password, role, is_system_admin) 
VALUES (
  'system_admin', 
  'system@assetflow.bg', 
  '$2b$12$LQv3c1yqBwEHXw47HvzOWOehHdBNppveYuwz4JSHGoP8CoJxlrn3.', 
  'system_admin', 
  true
) ON CONFLICT (email) DO NOTHING;