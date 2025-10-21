import Joi from 'joi';
import pool from '../database.js';
import emailService from '../services/emailService.js';

const requestSchema = Joi.object({
  equipment_id: Joi.number().integer().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  notes: Joi.string().optional()
});

export const createRequest = async (req, res) => {
  try {
    const { error, value } = requestSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { equipment_id, start_date, end_date, notes } = value;
    
    // check if equipment exists and is available
    const equipmentResult = await pool.query('SELECT * FROM equipment WHERE id = $1', [equipment_id]);
    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    const equipment = equipmentResult.rows[0];
    if (equipment.status !== 'available') {
      return res.status(400).json({ error: 'Equipment is not available' });
    }

    const result = await pool.query(
      `INSERT INTO requests (user_id, equipment_id, start_date, end_date, notes) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, equipment_id, start_date, end_date, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create request' });
  }
};

export const getUserRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.username, u.username as user_name, e.name as equipment_name, e.type as equipment_type 
       FROM requests r 
       JOIN users u ON r.user_id = u.id
       JOIN equipment e ON r.equipment_id = e.id 
       WHERE r.user_id = $1 
       ORDER BY r.request_date DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.username, u.username as user_name, e.name as equipment_name, e.type as equipment_type 
       FROM requests r 
       JOIN users u ON r.user_id = u.id 
       JOIN equipment e ON r.equipment_id = e.id 
       ORDER BY r.request_date DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if equipment requires manager approval and low stock status
    const requestResult = await pool.query(
      `SELECT r.*, e.requires_approval, e.name, e.serial_number, e.stock_threshold,
       (
         SELECT COUNT(*) FROM equipment e2 
         WHERE CASE
           WHEN RIGHT(e.serial_number, 3) ~ '^[0-9]{3}$'
             THEN LEFT(e.serial_number, GREATEST(LENGTH(e.serial_number) - 3, 0))
           ELSE e.serial_number
         END = CASE
           WHEN RIGHT(e2.serial_number, 3) ~ '^[0-9]{3}$'
             THEN LEFT(e2.serial_number, GREATEST(LENGTH(e2.serial_number) - 3, 0))
           ELSE e2.serial_number
         END
         AND e2.status = 'available'
       ) as available_count
       FROM requests r 
       JOIN equipment e ON r.equipment_id = e.id 
       WHERE r.id = $1 AND r.status = 'pending'`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    const request = requestResult.rows[0];
    const isLowStock = request.available_count <= request.stock_threshold;
    
    // If equipment is low stock, only admins can approve
    if (isLowStock && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'This equipment is low stock and requires admin approval only' });
    }
    
    // If equipment requires approval and user is not admin, need manager approval first
    if (request.requires_approval && req.user.role !== 'admin' && !request.manager_approved_by) {
      if (req.user.role === 'manager') {
        // Manager approval step
        const result = await pool.query(
          `UPDATE requests SET manager_approved_by = $1, manager_approved_at = CURRENT_TIMESTAMP 
           WHERE id = $2 RETURNING *`,
          [req.user.id, id]
        );
        return res.json({ ...result.rows[0], message: 'Manager approval recorded. Awaiting final approval.' });
      } else {
        return res.status(403).json({ error: 'This equipment requires manager approval first' });
      }
    }

    // Final approval
    const result = await pool.query(
      `UPDATE requests SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP, 
       due_date = end_date WHERE id = $2 RETURNING *`,
      [req.user.id, id]
    );

    // Update equipment status to checked_out
    await pool.query('UPDATE equipment SET status = $1 WHERE id = $2', ['checked_out', result.rows[0].equipment_id]);

    // Get user email and equipment name for notification
    const notificationData = await pool.query(
      `SELECT u.email, e.name as equipment_name, u2.username as approver_name
       FROM requests r
       JOIN users u ON r.user_id = u.id
       JOIN equipment e ON r.equipment_id = e.id
       JOIN users u2 ON r.approved_by = u2.id
       WHERE r.id = $1`,
      [id]
    );

    if (notificationData.rows.length > 0) {
      const { email, equipment_name, approver_name } = notificationData.rows[0];
      await emailService.sendRequestApprovalNotification(email, equipment_name, approver_name);
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve request' });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE requests SET status = 'rejected', approved_by = $1, approved_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND status = 'pending' RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
};

export const returnEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { return_condition, notes, early_return = false } = req.body;
    
    if (!['excellent', 'good', 'fair', 'poor'].includes(return_condition)) {
      return res.status(400).json({ error: 'Invalid return condition' });
    }

    const status = early_return ? 'early_returned' : 'returned';
    
    const result = await pool.query(
      `UPDATE requests SET status = $1, returned_at = CURRENT_TIMESTAMP, 
       return_condition = $2, notes = $3 WHERE id = $4 AND status = 'approved' RETURNING *`,
      [status, return_condition, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or not approved' });
    }

    // Update equipment status and condition
    await pool.query(
      'UPDATE equipment SET status = $1, condition = $2 WHERE id = $3',
      ['available', return_condition, result.rows[0].equipment_id]
    );

    // log condition change
    await pool.query(
      `INSERT INTO condition_logs (equipment_id, user_id, new_condition, notes) 
       VALUES ($1, $2, $3, $4)`,
      [result.rows[0].equipment_id, req.user.id, return_condition, notes]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to return equipment' });
  }
};

export const earlyReturnEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { return_condition, notes } = req.body;
    
    if (!['excellent', 'good', 'fair', 'poor'].includes(return_condition)) {
      return res.status(400).json({ error: 'Invalid return condition' });
    }

    const result = await pool.query(
      `UPDATE requests SET status = 'early_returned', returned_at = CURRENT_TIMESTAMP, 
       return_condition = $1, notes = $2 WHERE id = $3 AND status = 'approved' RETURNING *`,
      [return_condition, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or not approved' });
    }

    // Update equipment status and condition
    await pool.query(
      'UPDATE equipment SET status = $1, condition = $2 WHERE id = $3',
      ['available', return_condition, result.rows[0].equipment_id]
    );

    // log condition change
    await pool.query(
      `INSERT INTO condition_logs (equipment_id, user_id, new_condition, notes) 
       VALUES ($1, $2, $3, $4)`,
      [result.rows[0].equipment_id, req.user.id, return_condition, notes]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process early return' });
  }
};