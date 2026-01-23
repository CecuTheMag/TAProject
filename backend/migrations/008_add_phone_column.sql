-- Migration: 008_add_phone_column
-- Description: Add phone column to users table
-- Created: 2025-01-15

-- Add phone column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Create index for phone column
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);