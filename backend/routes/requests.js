import express from 'express';
import { authenticateToken, requireAdmin, requireTeacherOrAdmin } from '../middleware.js';
import {
  createRequest,
  getUserRequests,
  getAllRequests,
  approveRequest,
  rejectRequest,
  returnEquipment
} from '../controllers/requests.js';

const router = express.Router();

router.post('/', authenticateToken, createRequest);
router.get('/', authenticateToken, getUserRequests);
router.get('/manager', authenticateToken, requireTeacherOrAdmin, getAllRequests);
router.put('/:id/approve', authenticateToken, requireTeacherOrAdmin, approveRequest);
router.put('/:id/reject', authenticateToken, requireTeacherOrAdmin, rejectRequest);
router.put('/:id/return', authenticateToken, requireTeacherOrAdmin, returnEquipment);

export default router;