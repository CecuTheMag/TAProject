-- Create admin database and user
CREATE DATABASE "SIMS_ADMIN";
CREATE USER admin_user WITH PASSWORD 'admin_secure_pass_2025';
GRANT ALL PRIVILEGES ON DATABASE "SIMS_ADMIN" TO admin_user;

-- Connect to admin database
\c SIMS_ADMIN;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO admin_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_user;