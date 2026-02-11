import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireTeacherOrAdmin } from '../middleware/roleAuth.js';
import { setSchoolContext } from '../middleware/schoolContext.js';
import { getUsageReport, getHistoryReport, exportReport } from '../controllers/reports.js';

const router = express.Router();

router.use(setSchoolContext);

router.get('/usage', authenticateToken, requireTeacherOrAdmin, getUsageReport);
router.get('/history', authenticateToken, getHistoryReport);
router.get('/export', authenticateToken, requireTeacherOrAdmin, exportReport);

export default router;