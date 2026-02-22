import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireManagerTeacherOrAdmin } from '../middleware/roleAuth.js';
import { setSchoolContext } from '../middleware/schoolContext.js';
import { getUsageReport, getHistoryReport, exportReport } from '../controllers/reports.js';

const router = express.Router();

router.use(authenticateToken);
router.use(setSchoolContext);

router.get('/usage', requireManagerTeacherOrAdmin, getUsageReport);
router.get('/history', getHistoryReport);
router.get('/export', requireManagerTeacherOrAdmin, exportReport);

export default router;
