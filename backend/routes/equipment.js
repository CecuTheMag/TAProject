import express from 'express';
import { authenticateToken, requireAdmin, requireManagerTeacherOrAdmin } from '../middleware.js';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  deleteEquipment,
  updateRepairStatus,
  completeRepair,
  retireFleet,
  getEquipmentGroups,
  getLowStockAlerts
} from '../controllers/equipment.js';

const router = express.Router();

// Test route without auth
router.get('/test', (req, res) => {
  res.json({ message: 'Equipment endpoint working', timestamp: new Date().toISOString() });
});

router.get('/', authenticateToken, getAllEquipment);
router.get('/groups', authenticateToken, getEquipmentGroups);
router.get('/low-stock', authenticateToken, getLowStockAlerts);
router.put('/retire-fleet', authenticateToken, requireAdmin, retireFleet);
router.put('/repair', authenticateToken, requireManagerTeacherOrAdmin, updateRepairStatus);
router.put('/repair-complete', authenticateToken, requireManagerTeacherOrAdmin, completeRepair);
router.get('/:id', authenticateToken, getEquipmentById);
router.post('/', authenticateToken, requireAdmin, createEquipment);
router.put('/:id', authenticateToken, requireAdmin, updateEquipment);
router.put('/:id/status', authenticateToken, requireAdmin, updateEquipmentStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteEquipment);



export default router;