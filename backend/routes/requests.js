import express from 'express';
import { authenticateToken, requireAdmin, requireTeacherOrAdmin, requireManagerTeacherOrAdmin } from '../middleware.js';
import { setSchoolContext } from '../middleware/schoolContext.js';
import {
  createRequest,
  getUserRequests,
  getAllRequests,
  approveRequest,
  rejectRequest,
  returnEquipment,
  earlyReturnEquipment
} from '../controllers/requests.js';

const router = express.Router();

// Apply schema context to all routes
router.use(setSchoolContext);

router.post('/', authenticateToken, createRequest);
router.get('/', authenticateToken, getUserRequests);
router.get('/manager', authenticateToken, getAllRequests);
router.put('/:id/approve', authenticateToken, approveRequest);
router.put('/:id/reject', authenticateToken, rejectRequest);
router.put('/:id/return', authenticateToken, returnEquipment);
router.put('/:id/early-return', authenticateToken, earlyReturnEquipment);

export default router;