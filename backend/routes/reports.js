import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireTeacherOrAdmin } from '../middleware/roleAuth.js';
import { setSchoolContext } from '../middleware/schoolContext.js';
import { getUsageReport, getHistoryReport, exportReport } from '../controllers/reports.js';

const router = express.Router();

router.use(authenticateToken);
router.use(setSchoolContext);

router.get('/usage', requireTeacherOrAdmin, getUsageReport);
router.get('/history', getHistoryReport);
router.get('/export', requireTeacherOrAdmin, exportReport);

export default router;