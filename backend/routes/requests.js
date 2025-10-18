import express from 'express';
import { authenticateToken, requireAdmin, requireTeacherOrAdmin, requireManagerTeacherOrAdmin } from '../middleware.js';
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

router.post('/', authenticateToken, createRequest);
router.get('/', authenticateToken, getUserRequests);
router.get('/manager', authenticateToken, requireManagerTeacherOrAdmin, getAllRequests);
router.put('/:id/approve', authenticateToken, requireManagerTeacherOrAdmin, approveRequest);
router.put('/:id/reject', authenticateToken, requireManagerTeacherOrAdmin, rejectRequest);
router.put('/:id/return', authenticateToken, requireManagerTeacherOrAdmin, returnEquipment);
router.put('/:id/early-return', authenticateToken, earlyReturnEquipment);

export default router;