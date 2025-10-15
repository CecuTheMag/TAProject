import fs from 'fs';
import path from 'path';
import pool from '../database.js';
import cache from '../utils/cache.js';

export const getUsageReport = async (req, res) => {
  try {
    const cacheKey = 'usage_report';
    let report = cache.get(cacheKey);
    
    if (!report) {
      const result = await pool.query(`
        SELECT 
          e.name as equipment_name,
          e.type,
          COUNT(r.id)::integer as total_requests,
          COUNT(CASE WHEN r.status = 'approved' THEN 1 END)::integer as approved_requests,
          COUNT(CASE WHEN r.status = 'returned' THEN 1 END)::integer as returned_items
        FROM equipment e
        LEFT JOIN requests r ON e.id = r.equipment_id
        GROUP BY e.id, e.name, e.type
        ORDER BY total_requests DESC
      `);
      
      report = result.rows;
      cache.set(cacheKey, report, 300); // Cache for 5 minutes
    }
    
    res.json(report);
  } catch (error) {
    console.error('Usage report error:', error);
    res.status(500).json({ error: 'Failed to generate usage report' });
  }
};

export const getHistoryReport = async (req, res) => {
  try {
    const { user_id, equipment_id } = req.query;
    const cacheKey = `history_report_${user_id || 'all'}_${equipment_id || 'all'}`;
    let report = cache.get(cacheKey);
    
    if (!report) {
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

      query += ' ORDER BY r.request_date DESC LIMIT 1000'; // Limit for performance
      
      const result = await pool.query(query, params);
      report = result.rows;
      cache.set(cacheKey, report, 180); // Cache for 3 minutes
    }
    
    res.json(report);
  } catch (error) {
    console.error('History report error:', error);
    res.status(500).json({ error: 'Failed to generate history report' });
  }
};

export const exportReport = async (req, res) => {
  try {
    const { type, format = 'csv' } = req.query;
    console.log('Export request:', { type, format });
    
    let data, filename, headers;
    
    switch (type) {
      case 'inventory':
        const inventoryResult = await pool.query(`
          SELECT 
            e.name,
            e.type,
            COALESCE(e.serial_number, '') as serial_number,
            e.condition,
            e.status,
            COALESCE(e.location, '') as location,
            COALESCE(e.quantity, 1) as quantity,
            COALESCE(e.stock_threshold, 2) as stock_threshold,
            e.created_at
          FROM equipment e
          ORDER BY e.name
        `);
        data = inventoryResult.rows;
        filename = `inventory_report.${format}`;
        headers = [
          { id: 'name', title: 'Equipment Name' },
          { id: 'type', title: 'Type' },
          { id: 'serial_number', title: 'Serial Number' },
          { id: 'condition', title: 'Condition' },
          { id: 'status', title: 'Status' },
          { id: 'location', title: 'Location' },
          { id: 'quantity', title: 'Quantity' },
          { id: 'stock_threshold', title: 'Stock Threshold' },
          { id: 'created_at', title: 'Created Date' }
        ];
        break;
        
      case 'usage':
        const usageResult = await pool.query(`
          SELECT 
            e.name as equipment_name,
            e.type,
            COUNT(r.id)::integer as total_requests,
            COUNT(CASE WHEN r.status = 'approved' THEN 1 END)::integer as approved_requests,
            COUNT(CASE WHEN r.status = 'returned' THEN 1 END)::integer as returned_items
          FROM equipment e
          LEFT JOIN requests r ON e.id = r.equipment_id
          GROUP BY e.id, e.name, e.type
          ORDER BY total_requests DESC
        `);
        data = usageResult.rows;
        filename = `usage_report.${format}`;
        headers = [
          { id: 'equipment_name', title: 'Equipment Name' },
          { id: 'type', title: 'Type' },
          { id: 'total_requests', title: 'Total Requests' },
          { id: 'approved_requests', title: 'Approved Requests' },
          { id: 'returned_items', title: 'Returned Items' }
        ];
        break;
        
      case 'requests':
        const requestsResult = await pool.query(`
          SELECT 
            r.id,
            u.username,
            u.email,
            e.name as equipment_name,
            r.request_date,
            r.start_date,
            r.end_date,
            r.status,
            COALESCE(r.return_condition, '') as return_condition,
            COALESCE(r.notes, '') as notes
          FROM requests r
          JOIN users u ON r.user_id = u.id
          JOIN equipment e ON r.equipment_id = e.id
          ORDER BY r.request_date DESC
        `);
        data = requestsResult.rows;
        filename = `requests_report.${format}`;
        headers = [
          { id: 'id', title: 'Request ID' },
          { id: 'username', title: 'User' },
          { id: 'email', title: 'Email' },
          { id: 'equipment_name', title: 'Equipment' },
          { id: 'request_date', title: 'Request Date' },
          { id: 'start_date', title: 'Start Date' },
          { id: 'end_date', title: 'End Date' },
          { id: 'status', title: 'Status' },
          { id: 'return_condition', title: 'Return Condition' },
          { id: 'notes', title: 'Notes' }
        ];
        break;
        
      case 'maintenance':
        const maintenanceResult = await pool.query(`
          SELECT 
            e.name as equipment_name,
            e.type,
            e.condition,
            e.status
          FROM equipment e
          WHERE e.status = 'under_repair'
          ORDER BY e.name
        `);
        data = maintenanceResult.rows;
        filename = `maintenance_report.${format}`;
        headers = [
          { id: 'equipment_name', title: 'Equipment Name' },
          { id: 'type', title: 'Type' },
          { id: 'condition', title: 'Current Condition' },
          { id: 'status', title: 'Status' }
        ];
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    console.log('Data rows:', data.length);

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = headers.map(h => h.title).join(',');
      const csvRows = data.map(row => 
        headers.map(h => {
          let value = row[h.id];
          if (value === null || value === undefined) value = '';
          if (value instanceof Date) value = value.toISOString().split('T')[0];
          value = String(value);
          // Escape quotes and wrap in quotes if contains comma
          return value.includes(',') || value.includes('"') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      );
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } else {
      // Return JSON for other formats
      res.json({ data, headers, filename });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export report', details: error.message });
  }
};