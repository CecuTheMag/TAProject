-- Migration: Add documents column to equipment table
-- This column stores JSON array of document metadata

DO $$
BEGIN
    -- Check if column exists before adding
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'equipment' 
        AND column_name = 'documents'
    ) THEN
        ALTER TABLE equipment ADD COLUMN documents JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added documents column to equipment table';
    ELSE
        RAISE NOTICE 'documents column already exists';
    END IF;
END $$;

-- Also add to school-specific schemas
DO $$
DECLARE
    schema_record RECORD;
BEGIN
    FOR schema_record IN 
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name LIKE 'school_%'
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = schema_record.schema_name
            AND table_name = 'equipment' 
            AND column_name = 'documents'
        ) THEN
            EXECUTE format('ALTER TABLE %I.equipment ADD COLUMN documents JSONB DEFAULT ''[]''::jsonb', schema_record.schema_name);
            RAISE NOTICE 'Added documents column to %', schema_record.schema_name;
        END IF;
    END LOOP;
END $$;
