import Joi from 'joi';
import QRCode from 'qrcode';
import pool from '../database.js';
import cache from '../utils/cache.js';
import redisService from '../utils/redis.js';

const equipmentSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  serial_number: Joi.string().optional().allow(''),
  condition: Joi.string().valid('excellent', 'good', 'fair', 'poor').default('good'),
  status: Joi.string().valid('available', 'checked_out', 'under_repair', 'retired').default('available'),
  location: Joi.string().optional().allow(''),
  requires_approval: Joi.boolean().default(false),
  quantity: Joi.number().integer().min(1).default(1),
  stock_threshold: Joi.number().integer().min(1).default(2)
});

export const getAllEquipment = async (req, res) => {
  try {
    const { search, type, status, condition } = req.query;
    const cacheKey = `equipment:${JSON.stringify(req.query)}`;
    
    // Try Redis cache first
    const cached = await redisService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    let query = 'SELECT * FROM equipment WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR serial_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }
    if (condition) {
      paramCount++;
      query += ` AND condition = $${paramCount}`;
      params.push(condition);
    }

    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    
    // Cache result for 5 minutes
    await redisService.set(cacheKey, result.rows, 300);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

export const createEquipment = async (req, res) => {
  try {
    const {
      name,
      type,
      serial_number = null,
      condition = 'good',
      status = 'available',
      location = null,
      requires_approval = false,
      quantity = 1,
      stock_threshold = 2
    } = req.body;
    
    // Generate QR code with serial number
    let qrCode = null;
    try {
      const qrData = serial_number || `SIMS-${Date.now()}`;
      qrCode = await QRCode.toDataURL(qrData);
    } catch (qrError) {
      console.error('QR generation error:', qrError);
    }
    
    const result = await pool.query(
      `INSERT INTO equipment (name, type, serial_number, condition, status, location, requires_approval, quantity, stock_threshold, qr_code) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, type, serial_number, condition, status, location, requires_approval, quantity, stock_threshold, qrCode]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Equipment creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = equipmentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, type, serial_number, condition, status, location, requires_approval, quantity, stock_threshold } = value;
    
    const result = await pool.query(
      `UPDATE equipment SET name = $1, type = $2, serial_number = $3, condition = $4, 
       status = $5, location = $6, requires_approval = $7, quantity = $8, stock_threshold = $9 WHERE id = $10 RETURNING *`,
      [name, type, serial_number, condition, status, location, requires_approval, quantity, stock_threshold, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Invalidate related caches
    cache.delete('dashboard_stats');
    cache.delete('usage_report');
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update equipment' });
  }
};

export const updateEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['available', 'checked_out', 'under_repair', 'retired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE equipment SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update equipment status' });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM equipment WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Invalidate related caches
    cache.delete('dashboard_stats');
    cache.delete('usage_report');
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
};