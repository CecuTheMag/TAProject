import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware.js';
import { getUsageReport, getHistoryReport, exportReport } from '../controllers/reports.js';

const router = express.Router();

router.get('/usage', authenticateToken, requireAdmin, getUsageReport);
router.get('/history', authenticateToken, getHistoryReport);
router.get('/export', authenticateToken, requireAdmin, exportReport);

export default router;