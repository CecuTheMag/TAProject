import express from 'express';
import { setSchoolContext, queryInSchema } from '../middleware/schoolContext.js';

const router = express.Router();

router.use(setSchoolContext);

// Test route without auth
router.get('/test', (req, res) => {
  res.json({ message: 'Dashboard endpoint working', timestamp: new Date().toISOString() });
});

// Test route for school context
router.get('/test-school', async (req, res) => {
  try {
    const schoolCode = req.query.school || 'BGVHRFDXSE';
    const schoolSchema = `school_${schoolCode}`;
    
    const result = await queryInSchema(schoolSchema, 'SELECT COUNT(*) as count FROM users');
    res.json({ 
      school_code: schoolCode,
      school_schema: schoolSchema,
      user_count: parseInt(result.rows[0]?.count || 0),
      message: 'School context working'
    });
  } catch (error) {
    console.error('Test school error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    // Get comprehensive stats from school schema
    const equipmentResult = await queryInSchema(req.schoolSchema, 'SELECT COUNT(*) as count FROM equipment');
    const usersResult = await queryInSchema(req.schoolSchema, 'SELECT COUNT(*) as count FROM users');
    const requestsResult = await queryInSchema(req.schoolSchema, 'SELECT COUNT(*) as count FROM requests');
    const availableResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM equipment WHERE status = 'available'");
    const checkedOutResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM equipment WHERE status = 'checked_out'");
    const pendingResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM requests WHERE status = 'pending'");
    
    res.json({
      total_equipment: parseInt(equipmentResult.rows[0]?.count || 0),
      total_users: parseInt(usersResult.rows[0]?.count || 0),
      total_requests: parseInt(requestsResult.rows[0]?.count || 0),
      available_equipment: parseInt(availableResult.rows[0]?.count || 0),
      checked_out_equipment: parseInt(checkedOutResult.rows[0]?.count || 0),
      pending_requests: parseInt(pendingResult.rows[0]?.count || 0)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const result = await queryInSchema(req.schoolSchema, `
      SELECT r.*, u.username, e.name as equipment_name 
      FROM requests r 
      JOIN users u ON r.user_id = u.id 
      JOIN equipment e ON r.equipment_id = e.id 
      ORDER BY r.request_date DESC 
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const result = await queryInSchema(req.schoolSchema, `
      SELECT * FROM equipment 
      WHERE status = 'under_repair' OR condition_status = 'poor'
      ORDER BY updated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Dashboard alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

export default router;