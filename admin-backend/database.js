import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.ADMIN_DB_HOST,
  port: process.env.ADMIN_DB_PORT,
  database: process.env.ADMIN_DB_NAME,
  user: process.env.ADMIN_DB_USER,
  password: process.env.ADMIN_DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
