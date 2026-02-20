-- Migration: 009_add_documents_column
-- Description: Add documents column to equipment table for file attachments
-- Created: 2026-01-01

-- Add documents column to equipment table in all school schemas
DO $$
DECLARE
    schema_name TEXT;
BEGIN
    -- Get all school schemas
    FOR schema_name IN 
        SELECT nspname 
        FROM pg_namespace 
        WHERE nspname LIKE 'school_%'
    LOOP
        -- Add documents column if it doesn't exist
        EXECUTE format('
            ALTER TABLE %I.equipment 
            ADD COLUMN IF NOT EXISTS documents TEXT[] DEFAULT ARRAY[]::TEXT[]
        ', schema_name);
        
        RAISE NOTICE 'Added documents column to %.equipment', schema_name;
    END LOOP;
END $$;