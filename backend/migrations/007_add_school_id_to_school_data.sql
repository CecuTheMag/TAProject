-- Create default school if it doesn't exist
INSERT INTO schools (id, name, code) VALUES (1, 'Hristo Botev High School', 'HBHS') ON CONFLICT (id) DO NOTHING;

-- Add school_id column to school_data table
ALTER TABLE school_data ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id);

-- Update existing records to have school_id = 1 (default school)
UPDATE school_data SET school_id = 1 WHERE school_id IS NULL;