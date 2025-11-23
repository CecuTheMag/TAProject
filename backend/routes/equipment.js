import express from 'express';
import pool from '../database.js';
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
router.get('/search/:serial', authenticateToken, async (req, res) => {
  try {
    const { serial } = req.params;
    const result = await pool.query(
      'SELECT * FROM equipment WHERE serial_number ILIKE $1 LIMIT 1',
      [`%${serial}%`]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search equipment' });
  }
});
router.put('/retire-fleet', authenticateToken, requireAdmin, retireFleet);
router.put('/repair', authenticateToken, requireManagerTeacherOrAdmin, updateRepairStatus);
router.put('/repair-complete', authenticateToken, requireManagerTeacherOrAdmin, completeRepair);
router.post('/sync-status', authenticateToken, async (req, res) => {
  try {
    // Update equipment status based on active requests
    await pool.query(`
      UPDATE equipment 
      SET status = CASE 
        WHEN EXISTS (
          SELECT 1 FROM requests r 
          WHERE r.equipment_id = equipment.id 
            AND r.status = 'approved' 
            AND r.start_date <= CURRENT_DATE 
            AND r.end_date >= CURRENT_DATE
        ) THEN 'checked_out'
        WHEN status = 'checked_out' AND NOT EXISTS (
          SELECT 1 FROM requests r 
          WHERE r.equipment_id = equipment.id 
            AND r.status = 'approved' 
            AND r.start_date <= CURRENT_DATE 
            AND r.end_date >= CURRENT_DATE
        ) THEN 'available'
        ELSE status
      END
      WHERE status IN ('available', 'checked_out')
    `);
    
    res.json({ message: 'Equipment statuses synchronized successfully' });
  } catch (error) {
    console.error('Equipment sync error:', error);
    res.status(500).json({ error: 'Failed to sync equipment statuses' });
  }
});
router.get('/:id', authenticateToken, getEquipmentById);
router.post('/', authenticateToken, requireAdmin, createEquipment);
router.put('/:id', authenticateToken, requireAdmin, updateEquipment);
router.put('/:id/status', authenticateToken, requireAdmin, updateEquipmentStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteEquipment);



export default router;