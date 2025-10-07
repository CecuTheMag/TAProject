import Joi from 'joi';
import pool from '../database.js';

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
      `SELECT r.*, e.name as equipment_name, e.type as equipment_type 
       FROM requests r 
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
      `SELECT r.*, u.username, e.name as equipment_name, e.type as equipment_type 
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
    
    const result = await pool.query(
      `UPDATE requests SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND status = 'pending' RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    // update equipment status to checked_out
    await pool.query('UPDATE equipment SET status = $1 WHERE id = $2', ['checked_out', result.rows[0].equipment_id]);

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
    const { return_condition, notes } = req.body;
    
    if (!['excellent', 'good', 'fair', 'poor'].includes(return_condition)) {
      return res.status(400).json({ error: 'Invalid return condition' });
    }

    const result = await pool.query(
      `UPDATE requests SET status = 'returned', returned_at = CURRENT_TIMESTAMP, 
       return_condition = $1, notes = $2 WHERE id = $3 AND status = 'approved' RETURNING *`,
      [return_condition, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or not approved' });
    }

    // update equipment status and condition
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