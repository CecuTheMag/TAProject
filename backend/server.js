// SchoolSync Backend Server - Main Entry Point
// Handles API routing, middleware setup, and service initialization

// Core Express framework and middleware imports
import express from 'express';
import cors from 'cors';              // Cross-Origin Resource Sharing
import compression from 'compression'; // Response compression for performance
import helmet from 'helmet';          // Security headers
import dotenv from 'dotenv';          // Environment variable management

// Custom middleware imports
import { apiLimiter, authLimiter, reportLimiter, userLimiter } from './middleware/rateLimiter.js';
import { metricsMiddleware, metricsHandler } from './middleware/metrics.js';
import { setSchoolContext } from './middleware/schoolContext.js';
import { authenticateToken } from './middleware/auth.js';
import { securityMiddleware } from './middleware/security.js';
import { auditLogger } from './middleware/audit.js';

// Database and caching services
import { initDB } from './database.js';
import redisService from './utils/redis.js';
import { createSchoolSchema } from './utils/schemaManager.js';

// Route handlers for different API endpoints
import authRoutes from './routes/auth.js';         // User authentication
import equipmentRoutes from './routes/equipment.js'; // Equipment CRUD operations
import requestRoutes from './routes/requests.js';   // Equipment borrowing system
import reportRoutes from './routes/reports.js';     // Analytics and reporting
import dashboardRoutes from './routes/dashboard.js'; // Dashboard statistics
import alertRoutes from './routes/alerts.js';       // System alerts
import documentRoutes from './routes/documents.js'; // File management
import userRoutes from './routes/users.js';         // User management
import educationRoutes from './routes/education.js'; // Educational features
import internalRoutes from './routes/internal.js';   // Internal API for admin

// Background services
import alertService from './services/alertService.js';   // Alert monitoring
import emailService from './services/emailService.js';   // Email notifications


// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT;

// ===== MIDDLEWARE CONFIGURATION =====

// Security headers middleware - adds security headers to prevent common attacks
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false // Allow for development
}));
app.use(securityMiddleware.headers);

// Audit logging for security monitoring
app.use(auditLogger.middleware);

// CSRF protection with IP whitelist
app.use(securityMiddleware.csrf);

// Input sanitization
app.use(securityMiddleware.sanitize);

// Performance middleware - compresses responses to reduce bandwidth
app.use(compression());

// Manual CORS headers middleware - MUST come before cors() to ensure headers are set
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://school-sync.org',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  // Allow 192.168.88.* IP range
  const origin = req.get('Origin');
  if (origin && (allowedOrigins.includes(origin) || /^https?:\/\/192\.168\.88\..+/.test(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-School-Code, X-Admin-Panel');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// CORS middleware - enables cross-origin requests from specific origins
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://school-sync.org',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow specific origins and 192.168.88.* IP range
    if (allowedOrigins.includes(origin) || /^https?:\/\/192\.168\.88\..+/.test(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-School-Code', 'X-Admin-Panel'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
}));

// Body parsing middleware - handles JSON and URL-encoded data (10MB limit for file uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving - serves uploaded documents and images
app.use('/uploads', express.static('uploads'));

// Metrics collection middleware - tracks API performance and usage
app.use(metricsMiddleware);

// Request logging middleware - logs all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Enhanced rate limiting middleware - prevents API abuse
app.use('/auth', securityMiddleware.rateLimit(60000, 10, 'Too many authentication attempts'));
app.use('/api', securityMiddleware.rateLimit(60000, 100, 'Too many API requests'));

// Initialize database and Redis
initDB();
// Migration runner disabled - migrations handled manually
// migrationRunner.runMigrations().catch(console.error);

// Ensure documents column exists in all school schemas
const ensureDocumentsColumn = async () => {
  try {
    const { default: pool } = await import('./database.js');
    console.log('🔍 Checking documents column in equipment tables...');
    
    // Get all school schemas
    const schemasResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'school_%'
    `);
    
    for (const schema of schemasResult.rows) {
      const schemaName = schema.schema_name;
      
      try {
        // Check if column exists
        const columnCheck = await pool.query(`
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_schema = $1
          AND table_name = 'equipment' 
          AND column_name = 'documents'
        `, [schemaName]);
        
        if (columnCheck.rows.length === 0) {
          // Add documents column
          await pool.query(`
            ALTER TABLE "${schemaName}".equipment 
            ADD COLUMN documents JSONB DEFAULT '[]'::jsonb
          `);
          console.log(`✅ Added documents column to ${schemaName}.equipment`);
        } else {
          console.log(`⏭️  documents column already exists in ${schemaName}.equipment`);
        }
      } catch (error) {
        console.error(`❌ Error checking ${schemaName}:`, error.message);
      }
    }
    
    console.log('✅ Documents column check completed');
  } catch (error) {
    console.error('❌ Documents column migration failed:', error.message);
  }
};

// Initialize schema-per-school architecture
const initializeSchemas = async () => {
  try {
    const { default: pool } = await import('./database.js');
    
    // Ensure schools table exists first
    await pool.query(`
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
    
    const schools = await pool.query('SELECT code FROM schools');
    for (const school of schools.rows) {
      await createSchoolSchema(school.code);
    }
    console.log('✅ School schemas initialized');
    
    // Run documents column check after schema initialization
    await ensureDocumentsColumn();
  } catch (error) {
    console.error('❌ Schema initialization failed:', error.message);
  }
};
initializeSchemas();

redisService.connect().catch(() => {}); // Non-blocking Redis connection

// Routes with rate limiting - ORDER MATTERS: more specific routes first
// Document routes (must be before generic API routes to avoid conflicts)
app.use('/api/documents', documentRoutes);
app.use('/documents', documentRoutes);

// Other API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/reports', reportLimiter, reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userLimiter, userRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/internal', internalRoutes);

// Non-API routes (for backward compatibility)
app.use('/auth', authLimiter, authRoutes);
app.use('/equipment', equipmentRoutes);
app.use('/request', requestRoutes);
app.use('/reports', reportLimiter, reportRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/alerts', alertRoutes);
app.use('/users', userLimiter, userRoutes);
app.use('/education', educationRoutes);
app.use('/internal', internalRoutes);

// Direct curriculum test route
app.get('/education/curriculum-direct', (req, res) => {
  res.json({
    subjects: [],
    coverage_gaps: [],
    summary: {
      total_subjects: 0,
      subjects_with_equipment: 0,
      subjects_with_lessons: 0,
      total_equipment_mapped: 0
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    instance: process.env.INSTANCE_ID,
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'School Inventory Management System API',
    version: '1.0.0',
    instance: process.env.INSTANCE_ID,
    endpoints: {
      auth: '/auth (register, login, logout)',
      equipment: '/equipment (CRUD operations)',
      requests: '/request (borrowing system)',
      reports: '/reports (usage, history, export)'
    }
  });
});

app.get('/test', (req, res) => {
  res.json({ status: 'Backend working!', timestamp: new Date().toISOString() });
});

// Education curriculum endpoint directly in server
app.get('/education/curriculum', async (req, res) => {
  try {
    console.log('Direct curriculum endpoint hit');
    
    // Import pool here to avoid circular dependency
    const { default: pool } = await import('./database.js');
    
    const subjects = await pool.query('SELECT * FROM subjects ORDER BY name');
    
    res.json({
      subjects: subjects.rows.map(s => ({
        ...s,
        equipment_count: 5,
        available_equipment: 3,
        total_requests: 10,
        avg_impact_score: 4.2,
        equipment: []
      })),
      coverage_gaps: [],
      summary: {
        total_subjects: subjects.rows.length,
        subjects_with_equipment: subjects.rows.length,
        subjects_with_lessons: 0,
        total_equipment_mapped: subjects.rows.length * 5
      }
    });
  } catch (error) {
    console.error('Direct curriculum error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Metrics endpoint
app.get('/metrics', metricsHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start HTTP server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP Server running on http://0.0.0.0:${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://[your-ip]:${PORT}`);
});

// Start services
alertService.startScheduledChecks();
emailService.startReminderScheduler();



console.log(`Database: PostgreSQL (${process.env.DB_NAME})`);
console.log(`JWT Secret configured: ${!!process.env.JWT_SECRET}`);
