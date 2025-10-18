import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiLimiter, authLimiter, reportLimiter } from './middleware/rateLimiter.js';
import { metricsMiddleware, metricsHandler } from './middleware/metrics.js';
import { initDB } from './database.js';
import redisService from './utils/redis.js';
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import requestRoutes from './routes/requests.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import alertRoutes from './routes/alerts.js';
import documentRoutes from './routes/documents.js';
import userRoutes from './routes/users.js';
import alertService from './services/alertService.js';
import emailService from './services/emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and performance middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));
app.use(metricsMiddleware);
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