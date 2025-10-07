import createCsvWriter from 'csv-writer';
import pool from '../database.js';

export const getUsageReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.name as equipment_name,
        e.type,
        COUNT(r.id) as total_requests,
        COUNT(CASE WHEN r.status = 'approved' THEN 1 END) as approved_requests,
        COUNT(CASE WHEN r.status = 'returned' THEN 1 END) as returned_items
      FROM equipment e
      LEFT JOIN requests r ON e.id = r.equipment_id
      GROUP BY e.id, e.name, e.type
      ORDER BY total_requests DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate usage report' });
  }
};

export const getHistoryReport = async (req, res) => {
  try {
    const { user_id, equipment_id } = req.query;
    let query = `
      SELECT r.*, u.username, e.name as equipment_name, e.type as equipment_type
      FROM requests r
      JOIN users u ON r.user_id = u.id
      JOIN equipment e ON r.equipment_id = e.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      query += ` AND r.user_id = $${paramCount}`;
      params.push(user_id);
    }
    
    if (equipment_id) {
      paramCount++;
      query += ` AND r.equipment_id = $${paramCount}`;
      params.push(equipment_id);
    }

    query += ' ORDER BY r.request_date DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate history report' });
  }
};

export const exportReport = async (req, res) => {
  try {
    const { type } = req.query;
    
    let data, filename, headers;
    
    if (type === 'usage') {
      const result = await pool.query(`
        SELECT 
          e.name as equipment_name,
          e.type,
          e.serial_number,
          e.condition,
          e.status,
          COUNT(r.id) as total_requests
        FROM equipment e
        LEFT JOIN requests r ON e.id = r.equipment_id
        GROUP BY e.id, e.name, e.type, e.serial_number, e.condition, e.status
        ORDER BY total_requests DESC
      `);
      
      data = result.rows;
      filename = 'usage_report.csv';
      headers = [
        { id: 'equipment_name', title: 'Equipment Name' },
        { id: 'type', title: 'Type' },
        { id: 'serial_number', title: 'Serial Number' },
        { id: 'condition', title: 'Condition' },
        { id: 'status', title: 'Status' },
        { id: 'total_requests', title: 'Total Requests' }
      ];
    } else {
      const result = await pool.query(`
        SELECT 
          r.id,
          u.username,
          e.name as equipment_name,
          r.start_date,
          r.end_date,
          r.status,
          r.return_condition
        FROM requests r
        JOIN users u ON r.user_id = u.id
        JOIN equipment e ON r.equipment_id = e.id
        ORDER BY r.request_date DESC
      `);
      
      data = result.rows;
      filename = 'history_report.csv';
      headers = [
        { id: 'id', title: 'Request ID' },
        { id: 'username', title: 'User' },
        { id: 'equipment_name', title: 'Equipment' },
        { id: 'start_date', title: 'Start Date' },
        { id: 'end_date', title: 'End Date' },
        { id: 'status', title: 'Status' },
        { id: 'return_condition', title: 'Return Condition' }
      ];
    }

    const csvWriter = createCsvWriter({
      path: filename,
      header: headers
    });

    await csvWriter.writeRecords(data);
    
    res.download(filename, (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to download report' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export report' });
  }
};