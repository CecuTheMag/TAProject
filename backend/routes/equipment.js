import express from 'express';
import pool from '../database.js';
import { authenticateToken, requireAdmin, requireManagerTeacherOrAdmin } from '../middleware.js';
import { setSchoolContext, queryInSchema } from '../middleware/schoolContext.js';
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

// Apply schema context to all routes
router.use(setSchoolContext);

router.get('/', async (req, res) => {
  try {
    const result = await queryInSchema(req.schoolSchema, 'SELECT * FROM equipment ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});
router.get('/groups', getEquipmentGroups);
router.get('/low-stock', getLowStockAlerts);
router.get('/search/:serial', async (req, res) => {
  try {
    const { serial } = req.params;
    const result = await queryInSchema(
      req.schoolSchema,
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
router.put('/retire-fleet', requireAdmin, retireFleet);
router.put('/repair', requireManagerTeacherOrAdmin, updateRepairStatus);
router.put('/repair-complete', requireManagerTeacherOrAdmin, completeRepair);
router.post('/sync-status', async (req, res) => {
  try {
    await queryInSchema(req.schoolSchema, `
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
router.get('/:id', getEquipmentById);
router.post('/', requireAdmin, createEquipment);
router.put('/:id', requireAdmin, updateEquipment);
router.put('/:id/status', requireAdmin, updateEquipmentStatus);
router.delete('/:id', requireAdmin, deleteEquipment);



export default router;