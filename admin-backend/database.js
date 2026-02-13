import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres_admin',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'SIMS_ADMIN',
  user: process.env.DB_USER || 'admin_user',
  password: process.env.DB_PASSWORD || 'admin_secure_pass_2026',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
