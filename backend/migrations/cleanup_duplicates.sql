-- Remove duplicate schools, keeping only the first one of each
DELETE FROM schools a USING schools b
WHERE a.id > b.id 
AND a.code = b.code;

-- Verify remaining schools
SELECT id, name, code, status FROM schools ORDER BY id;
