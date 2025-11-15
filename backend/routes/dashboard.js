import express from 'express';
import { authenticateToken } from '../middleware.js';
import { getDashboardStats, getRecentActivity, getLowStockAlerts } from '../controllers/dashboard.js';

const router = express.Router();

// Test route without auth
router.get('/test', (req, res) => {
  res.json({ message: 'Dashboard endpoint working', timestamp: new Date().toISOString() });
});

router.get('/stats', authenticateToken, getDashboardStats);
router.get('/activity', authenticateToken, getRecentActivity);
router.get('/alerts', authenticateToken, getLowStockAlerts);

export default router;