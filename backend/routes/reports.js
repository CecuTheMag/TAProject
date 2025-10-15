import express from 'express';
import { authenticateToken, requireAdmin, requireTeacherOrAdmin } from '../middleware.js';
import { getUsageReport, getHistoryReport, exportReport } from '../controllers/reports.js';

const router = express.Router();

router.get('/usage', authenticateToken, requireTeacherOrAdmin, getUsageReport);
router.get('/history', authenticateToken, getHistoryReport);
router.get('/export', authenticateToken, requireTeacherOrAdmin, exportReport);

export default router;