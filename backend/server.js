import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './database.js';
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import requestRoutes from './routes/requests.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import alertRoutes from './routes/alerts.js';
import documentRoutes from './routes/documents.js';
import alertService from './services/alertService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Initialize database
initDB();

// Routes
app.use('/auth', authRoutes);
app.use('/equipment', equipmentRoutes);
app.use('/request', requestRoutes);
app.use('/reports', reportRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/alerts', alertRoutes);
app.use('/documents', documentRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'School Inventory Management System API',
    version: '1.0.0',
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: PostgreSQL (${process.env.DB_NAME})`);
  console.log(`JWT Secret configured: ${!!process.env.JWT_SECRET}`);
  
  // Start alert service
  alertService.startScheduledChecks();
});