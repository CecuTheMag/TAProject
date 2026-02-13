-- Update QR code columns in all school schemas to support full data URLs
-- This script should be run against the PostgreSQL database

DO $$
DECLARE
    school_record RECORD;
    schema_name TEXT;
BEGIN
    -- Loop through all schools
    FOR school_record IN 
        SELECT code FROM schools WHERE code IS NOT NULL
    LOOP
        schema_name := 'school_' || school_record.code;
        
        -- Check if schema exists and update qr_code column
        IF EXISTS (
            SELECT 1 FROM information_schema.schemata 
            WHERE schema_name = schema_name
        ) THEN
            BEGIN
                EXECUTE format('ALTER TABLE %I.equipment ALTER COLUMN qr_code TYPE TEXT', schema_name);
                RAISE NOTICE 'Updated QR code column for school: %', school_record.code;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Error updating school %: %', school_record.code, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Schema not found for school: %', school_record.code;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'QR code column updates completed';
END $$;