import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware.js';
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
router.get('/manager', authenticateToken, requireAdmin, getAllRequests);
router.put('/:id/approve', authenticateToken, requireAdmin, approveRequest);
router.put('/:id/reject', authenticateToken, requireAdmin, rejectRequest);
router.put('/:id/return', authenticateToken, requireAdmin, returnEquipment);

export default router;