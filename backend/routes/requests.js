import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin, requireTeacherOrAdmin, requireManagerOrAdmin, requireManagerTeacherOrAdmin } from '../middleware/roleAuth.js';
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

router.use(authenticateToken);
router.use(setSchoolContext);

router.post('/', createRequest);
router.get('/', getUserRequests);
router.get('/manager', requireManagerTeacherOrAdmin, getAllRequests);
router.put('/:id/approve', requireManagerTeacherOrAdmin, approveRequest);
router.put('/:id/reject', requireManagerTeacherOrAdmin, rejectRequest);
router.put('/:id/return', requireManagerTeacherOrAdmin, returnEquipment);
router.put('/:id/early-return', requireManagerTeacherOrAdmin, earlyReturnEquipment);

export default router;
