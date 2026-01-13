import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createSchool, getSchools, createSchoolAdmin, getSchoolAdmins, getSystemStats } from '../controllers/systemAdmin.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', getSystemStats);
router.get('/schools', getSchools);
router.post('/schools', createSchool);
router.get('/school-admins', getSchoolAdmins);
router.post('/school-admins', createSchoolAdmin);

export default router;
