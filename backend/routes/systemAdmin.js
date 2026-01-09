import express from 'express';
import { authenticateToken, requireSystemAdmin } from '../middleware.js';
import {
  createSchool,
  getSchools,
  createSchoolAdmin,
  getSchoolAdmins,
  updateSchoolStatus,
  getSystemStats
} from '../controllers/systemAdmin.js';

const router = express.Router();

// All routes require system admin authentication
router.use(authenticateToken);
router.use(requireSystemAdmin);

// School management
router.post('/schools', createSchool);
router.get('/schools', getSchools);
router.put('/schools/:id/status', updateSchoolStatus);

// School admin management
router.post('/school-admins', createSchoolAdmin);
router.get('/school-admins', getSchoolAdmins);

// System statistics
router.get('/stats', getSystemStats);

export default router;