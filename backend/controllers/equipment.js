import Joi from 'joi';
import QRCode from 'qrcode';
import pool from '../database.js';
import cache from '../utils/cache.js';
import redisService from '../utils/redis.js';

const equipmentSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  serial_number: Joi.string().optional().allow('').allow(null),
  condition: Joi.string().valid('excellent', 'good', 'fair', 'poor').default('good'),
  status: Joi.string().valid('available', 'checked_out', 'under_repair', 'retired').default('available'),
  location: Joi.string().optional().allow('').allow(null),
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

    query += ' ORDER BY name, serial_number';
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
      serial_number,
      condition = 'good',
      status = 'available',
      location,
      requires_approval = false,
      quantity = 1,
      stock_threshold = 2
    } = req.body;
    
    console.log('Creating equipment with quantity:', quantity);
    
    const createdEquipment = [];
    
    // Generate base serial if none provided or empty
    const timestamp = Date.now().toString();
    const baseSerial = (serial_number && serial_number.trim()) ? serial_number.trim() : `EQ${timestamp.slice(-6)}`;
    
    for (let i = 1; i <= parseInt(quantity); i++) {
      const itemSerial = `${baseSerial}${i.toString().padStart(3, '0')}`;
      
      console.log(`Creating item ${i}/${quantity} with serial: ${itemSerial}`);
      
      // Check if serial already exists
      const existingSerial = await pool.query('SELECT id FROM equipment WHERE serial_number = $1', [itemSerial]);
      if (existingSerial.rows.length > 0) {
        throw new Error(`Serial number ${itemSerial} already exists`);
      }
      
      // Generate QR code for each item
      let qrCode = null;
      try {
        qrCode = await QRCode.toDataURL(itemSerial);
      } catch (qrError) {
        console.error('QR generation error:', qrError);
      }
      
      const result = await pool.query(
        `INSERT INTO equipment (name, type, serial_number, condition, status, location, requires_approval, quantity, stock_threshold, qr_code) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [name, type, itemSerial, condition, status, location, requires_approval, 1, stock_threshold, qrCode]
      );
      
      createdEquipment.push(result.rows[0]);
    }

    console.log(`Created ${createdEquipment.length} equipment items`);
    
    // Invalidate related caches
    cache.delete('dashboard_stats');
    cache.delete('usage_report');
    await redisService.flushAll();
    
    res.status(201).json(createdEquipment);
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

export const updateRepairStatus = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid equipment selection - ids array required' });
    }

    const result = await pool.query(
      'UPDATE equipment SET status = $1 WHERE id = ANY($2) AND status = $3 RETURNING *',
      ['under_repair', ids, 'available']
    );
    
    cache.delete('dashboard_stats');
    await redisService.flushAll();
    
    res.json({ message: `${result.rows.length} items put under repair`, updated_items: result.rows.length });
  } catch (error) {
    console.error('Repair status update error:', error);
    res.status(500).json({ error: 'Failed to update repair status' });
  }
};

export const completeRepair = async (req, res) => {
  try {
    const { ids, condition } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid equipment selection - ids array required' });
    }
    
    if (!condition || !['excellent', 'good', 'fair', 'poor'].includes(condition)) {
      return res.status(400).json({ error: 'Valid condition required' });
    }

    const result = await pool.query(
      'UPDATE equipment SET status = $1, condition = $2 WHERE id = ANY($3) AND status = $4 RETURNING *',
      ['available', condition, ids, 'under_repair']
    );
    
    cache.delete('dashboard_stats');
    await redisService.flushAll();
    
    res.json({ message: `${result.rows.length} items completed repair`, updated_items: result.rows.length });
  } catch (error) {
    console.error('Complete repair error:', error);
    res.status(500).json({ error: 'Failed to complete repair' });
  }
};

export const retireFleet = async (req, res) => {
  try {
    const { ids } = req.body;
    
    console.log('Retiring fleet items:', ids);
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid equipment selection - ids array required' });
    }

    const result = await pool.query(
      'UPDATE equipment SET status = $1 WHERE id = ANY($2::int[]) RETURNING *',
      ['retired', ids]
    );
    
    console.log(`Retired ${result.rows.length} items`);
    
    // Clear all caches
    cache.delete('dashboard_stats');
    cache.delete('usage_report');
    try {
      await redisService.flushAll();
    } catch (error) {
      console.log('Redis cache clear failed:', error.message);
    }
    
    res.json({ message: `${result.rows.length} items retired from fleet`, updated_items: result.rows.length });
  } catch (error) {
    console.error('Retire fleet error:', error);
    res.status(500).json({ error: 'Failed to retire fleet' });
  }
};

export const getEquipmentGroups = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        CASE
          WHEN RIGHT(serial_number, 3) ~ '^[0-9]{3}$'
            THEN LEFT(serial_number, GREATEST(LENGTH(serial_number) - 3, 0))
          ELSE serial_number
        END AS base_serial,
        name,
        type,
        COUNT(*) AS total_count,
        COUNT(CASE WHEN status = 'available' THEN 1 END) AS available_count,
        COUNT(CASE WHEN status = 'checked_out' THEN 1 END) AS checked_out_count,
        COUNT(CASE WHEN status = 'under_repair' THEN 1 END) AS under_repair_count,
        COALESCE(MIN(stock_threshold), 2) AS stock_threshold,
        array_agg(json_build_object('id', id, 'serial_number', serial_number, 'status', status, 'condition', condition) ORDER BY serial_number) AS items
      FROM equipment
      WHERE serial_number IS NOT NULL
      GROUP BY base_serial, name, type
      ORDER BY name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Equipment groups error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment groups' });
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

export const getLowStockAlerts = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH groups AS (
        SELECT
          CASE
            WHEN RIGHT(serial_number, 3) ~ '^[0-9]{3}$'
              THEN LEFT(serial_number, GREATEST(LENGTH(serial_number) - 3, 0))
            ELSE serial_number
          END AS base_serial,
          name,
          type,
          COUNT(*) AS total_count,
          COUNT(CASE WHEN status = 'available' THEN 1 END) AS available_count,
          COALESCE(MIN(stock_threshold), 2) AS stock_threshold
        FROM equipment
        WHERE serial_number IS NOT NULL
        GROUP BY base_serial, name, type
      )
      SELECT * FROM groups
      WHERE available_count <= stock_threshold
      ORDER BY available_count
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Low stock alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
};

