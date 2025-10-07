import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware.js';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  deleteEquipment
} from '../controllers/equipment.js';

const router = express.Router();

router.get('/', authenticateToken, getAllEquipment);
router.get('/:id', authenticateToken, getEquipmentById);
router.post('/', authenticateToken, requireAdmin, createEquipment);
router.put('/:id', authenticateToken, requireAdmin, updateEquipment);
router.put('/:id/status', authenticateToken, requireAdmin, updateEquipmentStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteEquipment);

export default router;