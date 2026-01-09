-- Create school_data table from CSV
CREATE TABLE IF NOT EXISTS school_data (
  id INTEGER PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

-- Insert sample data (first few rows for testing)
INSERT INTO school_data (id, name, phone, role, email) VALUES
(1, 'Maria Petrova', '0888123456', 'MATHEMATICS', 'maria.petrova@hbschool.bg'),
(2, 'Ivan Georgiev', '0889234567', 'MATHEMATICS', 'ivan.georgiev@hbschool.bg'),
(35, 'Director Ivan Stoyanov', '0885567890', 'ADMINISTRATOR', 'director@hbschool.bg'),
(101, 'Petya Petkova', '088565001', '5A', 'petya.petkova.5a@student.hbschool.bg'),
(102, 'Boris Georgiev', '088565002', '5A', 'boris.georgiev.5a@student.hbschool.bg')
ON CONFLICT (email) DO NOTHING;