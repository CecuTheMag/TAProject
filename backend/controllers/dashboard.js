import pool from '../database.js';
import cache from '../utils/cache.js';

export const getDashboardStats = async (req, res) => {
  try {
    const cacheKey = 'dashboard_stats';
    let stats = cache.get(cacheKey);
    
    if (!stats) {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_equipment,
          COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
          COUNT(CASE WHEN status = 'checked_out' THEN 1 END) as checked_out,
          COUNT(CASE WHEN status = 'under_repair' THEN 1 END) as under_repair,
          COUNT(CASE WHEN status = 'retired' THEN 1 END) as retired
        FROM equipment
      `;
      
      const requestsQuery = `
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
          COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned_requests,
          COUNT(CASE WHEN status = 'early_returned' THEN 1 END) as early_returned_requests
        FROM requests
      `;
      
      const weeklyTrendsQuery = `
        SELECT 
          COUNT(CASE WHEN e.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_equipment_week,
          COUNT(CASE WHEN r.request_date >= NOW() - INTERVAL '7 days' AND r.status = 'approved' THEN 1 END) as new_checkouts_week,
          COUNT(CASE WHEN r.returned_at >= NOW() - INTERVAL '7 days' THEN 1 END) as returns_week,
          COUNT(CASE WHEN e.status = 'under_repair' AND e.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_repairs_week
        FROM equipment e
        LEFT JOIN requests r ON e.id = r.equipment_id
      `;

      const [equipmentStats, requestStats, weeklyTrends] = await Promise.all([
        pool.query(statsQuery),
        pool.query(requestsQuery),
        pool.query(weeklyTrendsQuery)
      ]);

      stats = {
        equipment: equipmentStats.rows[0],
        requests: requestStats.rows[0],
        weeklyTrends: weeklyTrends.rows[0]
      };
      
      cache.set(cacheKey, stats, 60); // Cache for 1 minute
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const cacheKey = 'recent_activity';
    let activity = cache.get(cacheKey);
    
    if (!activity) {
      const result = await pool.query(`
        SELECT 
          'request' as type,
          r.id,
          r.status,
          r.request_date as date,
          u.username,
          e.name as equipment_name
        FROM requests r
        JOIN users u ON r.user_id = u.id
        JOIN equipment e ON r.equipment_id = e.id
        ORDER BY r.request_date DESC
        LIMIT 10
      `);
      
      activity = result.rows;
      cache.set(cacheKey, activity, 30); // Cache for 30 seconds
    }

    res.json(activity);
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

export const getLowStockAlerts = async (req, res) => {
  try {
    // For now, we'll simulate low stock by checking equipment types with few available items
    const lowStockQuery = `
      SELECT 
        type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_count
      FROM equipment
      GROUP BY type
      HAVING COUNT(CASE WHEN status = 'available' THEN 1 END) <= 2
      ORDER BY available_count ASC
    `;

    const result = await pool.query(lowStockQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Low stock alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
};