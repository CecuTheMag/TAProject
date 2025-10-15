import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware.js';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  createUser,
  getUserActivity
} from '../controllers/users.js';

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.post('/', authenticateToken, requireAdmin, createUser);
router.put('/:id/role', authenticateToken, requireAdmin, updateUserRole);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);
router.get('/:id/activity', authenticateToken, requireAdmin, getUserActivity);

export default router;