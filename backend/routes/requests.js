import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin, requireTeacherOrAdmin, requireManagerOrAdmin } from '../middleware/roleAuth.js';
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
router.get('/manager', getAllRequests);
router.put('/:id/approve', approveRequest);
router.put('/:id/reject', rejectRequest);
router.put('/:id/return', returnEquipment);
router.put('/:id/early-return', earlyReturnEquipment);

export default router;