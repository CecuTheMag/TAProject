import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from './database.js';
import authRoutes from './routes/auth.js';
import systemAdminRoutes from './routes/systemAdmin.js';

dotenv.config();

const app = express();
const PORT = process.env.ADMIN_PORT;

// Enhanced CORS configuration
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Admin-Panel'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Admin-Panel');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/auth', authRoutes);
app.use('/system-admin', systemAdminRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'admin-backend',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Keep original /health for Docker health checks
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'admin-backend',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Admin Backend Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
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

    const adminCheck = await client.query('SELECT * FROM admin_users WHERE email = $1', [process.env.DEFAULT_ADMIN_EMAIL]);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 12);
      await client.query(
        'INSERT INTO admin_users (username, email, password, is_system_admin) VALUES ($1, $2, $3, $4)',
        [process.env.DEFAULT_ADMIN_USERNAME, process.env.DEFAULT_ADMIN_EMAIL, hashedPassword, true]
      );
      console.log(`✅ System admin created: ${process.env.DEFAULT_ADMIN_EMAIL}`);
    } else {
      // Update existing admin password
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 12);
      await client.query(
        'UPDATE admin_users SET password = $1 WHERE email = $2',
        [hashedPassword, process.env.DEFAULT_ADMIN_EMAIL]
      );
      console.log(`ℹ️ System admin password updated: ${process.env.DEFAULT_ADMIN_EMAIL}`);
    }

    console.log('✅ Admin database initialized');
  } catch (error) {
    console.error('❌ Failed to initialize admin database:', error);
  } finally {
    client.release();
  }
};

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Admin Backend running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}).catch(error => {
  console.error('❌ Failed to start admin backend:', error);
  process.exit(1);
});
