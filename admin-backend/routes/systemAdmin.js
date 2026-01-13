import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createSchool, getSchools, createSchoolAdmin, getSchoolAdmins, getSystemStats } from '../controllers/systemAdmin.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', getSystemStats);
router.get('/schools', getSchools);
router.post('/schools', createSchool);
router.get('/admins', getSchoolAdmins);
router.get('/school-admins', getSchoolAdmins);
router.post('/admins', createSchoolAdmin);
router.post('/school-admins', createSchoolAdmin);
router.delete('/admins/:id', async (req, res) => res.status(501).json({ error: 'Not implemented' }));
router.put('/schools/:id', async (req, res) => res.status(501).json({ error: 'Not implemented' }));
router.delete('/schools/:id', async (req, res) => res.status(501).json({ error: 'Not implemented' }));

export default router;
