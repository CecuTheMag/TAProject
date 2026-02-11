import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { setSchoolContext, queryInSchema } from '../middleware/schoolContext.js';

const router = express.Router();

router.use(authenticateToken);
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
    console.log(`Dashboard stats - School: ${req.schoolCode}, Schema: ${req.schoolSchema}`);
    
    // Get comprehensive stats from school schema
    const equipmentResult = await queryInSchema(req.schoolSchema, 'SELECT COUNT(*) as count FROM equipment');
    const availableResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM equipment WHERE status = 'available'");
    const checkedOutResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM equipment WHERE status = 'checked_out'");
    const underRepairResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM equipment WHERE status = 'under_repair'");
    const retiredResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM equipment WHERE status = 'retired'");
    
    const requestsResult = await queryInSchema(req.schoolSchema, 'SELECT COUNT(*) as count FROM requests');
    const pendingResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM requests WHERE status = 'pending'");
    const approvedResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM requests WHERE status = 'approved'");
    const rejectedResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM requests WHERE status = 'rejected'");
    const returnedResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM requests WHERE status = 'returned'");
    const earlyReturnedResult = await queryInSchema(req.schoolSchema, "SELECT COUNT(*) as count FROM requests WHERE status = 'early_returned'");
    
    // Return flat structure that matches frontend expectations
    res.json({
      total_equipment: parseInt(equipmentResult.rows[0]?.count || 0),
      available_equipment: parseInt(availableResult.rows[0]?.count || 0),
      checked_out_equipment: parseInt(checkedOutResult.rows[0]?.count || 0),
      under_repair: parseInt(underRepairResult.rows[0]?.count || 0),
      retired: parseInt(retiredResult.rows[0]?.count || 0),
      total_requests: parseInt(requestsResult.rows[0]?.count || 0),
      pending_requests: parseInt(pendingResult.rows[0]?.count || 0),
      approved_requests: parseInt(approvedResult.rows[0]?.count || 0),
      rejected_requests: parseInt(rejectedResult.rows[0]?.count || 0),
      returned_requests: parseInt(returnedResult.rows[0]?.count || 0),
      early_returned_requests: parseInt(earlyReturnedResult.rows[0]?.count || 0),
      total_returned_requests: parseInt(returnedResult.rows[0]?.count || 0) + parseInt(earlyReturnedResult.rows[0]?.count || 0)
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