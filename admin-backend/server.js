import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from './database.js';
import authRoutes from './routes/auth.js';
import systemAdminRoutes from './routes/systemAdmin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/system-admin', systemAdminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'admin-backend' });
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_system_admin BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        address VARCHAR(500),
        phone VARCHAR(20),
        email VARCHAR(255),
        domain VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        school_id INTEGER REFERENCES schools(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const adminCheck = await client.query('SELECT * FROM admin_users WHERE email = $1', ['admin@assetflow.bg']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('assetflow2025', 12);
      await client.query(
        'INSERT INTO admin_users (username, email, password, is_system_admin) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@assetflow.bg', hashedPassword, true]
      );
      console.log('✅ System admin created: admin@assetflow.bg');
    }

    console.log('✅ Admin database initialized');
  } catch (error) {
    console.error('❌ Failed to initialize admin database:', error);
  } finally {
    client.release();
  }
};

initDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin Backend running on port ${PORT}`);
});
