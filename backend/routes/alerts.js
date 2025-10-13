import express from 'express';
import pool from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware.js';

const router = express.Router();

// Get low stock alerts
router.get('/low-stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT e.id, e.name, e.type, e.quantity, e.stock_threshold,
             (SELECT COUNT(*) FROM requests r WHERE r.equipment_id = e.id AND r.status = 'approved' AND r.returned_at IS NULL) as checked_out,
             (e.quantity - (SELECT COUNT(*) FROM requests r WHERE r.equipment_id = e.id AND r.status = 'approved' AND r.returned_at IS NULL)) as available
      FROM equipment e
      WHERE (e.quantity - (SELECT COUNT(*) FROM requests r WHERE r.equipment_id = e.id AND r.status = 'approved' AND r.returned_at IS NULL)) <= e.stock_threshold
      ORDER BY available ASC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

// Get overdue equipment
router.get('/overdue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT r.id, r.due_date, r.start_date, r.end_date,
             u.username, u.email, e.name as equipment_name, e.type
      FROM requests r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.status = 'approved' 
      AND r.due_date < NOW()
      AND r.returned_at IS NULL
      ORDER BY r.due_date ASC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching overdue equipment:', error);
    res.status(500).json({ error: 'Failed to fetch overdue equipment' });
  }
});

// Update equipment stock threshold
router.put('/threshold/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_threshold } = req.body;
    
    const query = 'UPDATE equipment SET stock_threshold = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [stock_threshold, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating stock threshold:', error);
    res.status(500).json({ error: 'Failed to update stock threshold' });
  }
});

export default router;