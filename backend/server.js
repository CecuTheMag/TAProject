// SIMS Backend Server - Main Entry Point
// Handles API routing, middleware setup, and service initialization

// Core Express framework and middleware imports
import express from 'express';
import cors from 'cors';              // Cross-Origin Resource Sharing
import compression from 'compression'; // Response compression for performance
import helmet from 'helmet';          // Security headers
import dotenv from 'dotenv';          // Environment variable management

// Custom middleware imports
import { apiLimiter, authLimiter, reportLimiter } from './middleware/rateLimiter.js';
import { metricsMiddleware, metricsHandler } from './middleware/metrics.js';

// Database and caching services
import { initDB } from './database.js';
import redisService from './utils/redis.js';

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

// Background services
import alertService from './services/alertService.js';   // Alert monitoring
import emailService from './services/emailService.js';   // Email notifications


// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE CONFIGURATION =====

// Security middleware - adds security headers to prevent common attacks
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow cross-origin requests
}));

// Performance middleware - compresses responses to reduce bandwidth
app.use(compression());

// CORS middleware - enables cross-origin requests from frontend
app.use(cors());

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

// Rate limiting middleware - prevents API abuse (10 requests per second)
app.use(apiLimiter);

// Initialize database and Redis
initDB();
redisService.connect().catch(() => {}); // Non-blocking Redis connection

// Routes with rate limiting
app.use('/auth', authLimiter, authRoutes);
app.use('/equipment', equipmentRoutes);
app.use('/request', requestRoutes);
app.use('/reports', reportLimiter, reportRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/alerts', alertRoutes);
app.use('/documents', documentRoutes);
app.use('/users', userRoutes);
app.use('/education', educationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    instance: process.env.INSTANCE_ID || 'unknown',
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'School Inventory Management System API',
    version: '1.0.0',
    instance: process.env.INSTANCE_ID || 'unknown',
    endpoints: {
      auth: '/auth (register, login, logout)',
      equipment: '/equipment (CRUD operations)',
      requests: '/request (borrowing system)',
      reports: '/reports (usage, history, export)'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ status: 'Backend working!', timestamp: new Date().toISOString() });
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