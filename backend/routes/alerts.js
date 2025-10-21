import express from 'express';
import pool from '../database.js';
import { authenticateToken, requireAdmin, requireTeacherOrAdmin } from '../middleware.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Get low stock alerts
router.get('/low-stock', authenticateToken, requireTeacherOrAdmin, async (req, res) => {
  try {
    const query = `
      WITH groups AS (
        SELECT
          CASE
            WHEN RIGHT(serial_number, 3) ~ '^[0-9]{3}$'
              THEN LEFT(serial_number, GREATEST(LENGTH(serial_number) - 3, 0))
            ELSE serial_number
          END AS base_serial,
          name,
          type,
          COUNT(CASE WHEN status != 'retired' THEN 1 END) AS total_count,
          COUNT(CASE WHEN status = 'available' THEN 1 END) AS available_count,
          COALESCE(MIN(stock_threshold), 2) AS stock_threshold,
          MIN(id) as id
        FROM equipment
        WHERE serial_number IS NOT NULL
        GROUP BY base_serial, name, type
        HAVING COUNT(CASE WHEN status != 'retired' THEN 1 END) > 0
      )
      SELECT * FROM groups
      WHERE available_count <= stock_threshold
      ORDER BY available_count
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

// Get overdue equipment
router.get('/overdue', authenticateToken, requireTeacherOrAdmin, async (req, res) => {
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
router.put('/threshold/:base_serial', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { base_serial } = req.params;
    const { stock_threshold } = req.body;
    
    console.log('Updating threshold for base_serial:', base_serial, 'to:', stock_threshold);
    
    // Update all equipment items with the same base serial
    const query = `
      UPDATE equipment 
      SET stock_threshold = $1 
      WHERE (
        CASE
          WHEN RIGHT(serial_number, 3) ~ '^[0-9]{3}$'
            THEN LEFT(serial_number, GREATEST(LENGTH(serial_number) - 3, 0))
          ELSE serial_number
        END
      ) = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [stock_threshold, base_serial]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment group not found' });
    }
    
    res.json({ message: `Updated ${result.rows.length} items`, updated_count: result.rows.length });
  } catch (error) {
    console.error('Error updating stock threshold:', error);
    res.status(500).json({ error: 'Failed to update stock threshold' });
  }
});

// Test email reminders manually
router.post('/test-emails', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const count = await emailService.checkAndSendOverdueReminders();
    res.json({ message: `Sent ${count} reminder emails`, count });
  } catch (error) {
    console.error('Error testing emails:', error);
    res.status(500).json({ error: 'Failed to test emails' });
  }
});

export default router;