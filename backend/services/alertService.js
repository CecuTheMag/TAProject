const db = require('../database');
const emailService = require('./emailService');

class AlertService {
  async checkOverdueEquipment() {
    try {
      const overdueQuery = `
        SELECT r.id, r.user_id, r.equipment_id, r.due_date,
               u.email, u.username, e.name as equipment_name
        FROM requests r
        JOIN users u ON r.user_id = u.id
        JOIN equipment e ON r.equipment_id = e.id
        WHERE r.status = 'approved' 
        AND r.due_date < NOW()
        AND r.returned_at IS NULL
      `;
      
      const overdueItems = await db.query(overdueQuery);
      
      for (const item of overdueItems.rows) {
        await emailService.sendOverdueReminder(
          item.email,
          item.equipment_name,
          item.due_date
        );
      }
      
      console.log(`Processed ${overdueItems.rows.length} overdue reminders`);
    } catch (error) {
      console.error('Error checking overdue equipment:', error);
    }
  }

  async checkLowStock() {
    try {
      const lowStockQuery = `
        SELECT e.id, e.name, e.quantity, e.stock_threshold,
               (SELECT COUNT(*) FROM requests r WHERE r.equipment_id = e.id AND r.status = 'approved' AND r.returned_at IS NULL) as checked_out
        FROM equipment e
        WHERE (e.quantity - (SELECT COUNT(*) FROM requests r WHERE r.equipment_id = e.id AND r.status = 'approved' AND r.returned_at IS NULL)) <= e.stock_threshold
      `;
      
      const lowStockItems = await db.query(lowStockQuery);
      
      // Get admin emails
      const adminQuery = 'SELECT email FROM users WHERE role = $1';
      const admins = await db.query(adminQuery, ['admin']);
      
      for (const item of lowStockItems.rows) {
        const availableStock = item.quantity - item.checked_out;
        
        for (const admin of admins.rows) {
          await emailService.sendLowStockAlert(
            admin.email,
            item.name,
            availableStock,
            item.stock_threshold
          );
        }
      }
      
      console.log(`Processed ${lowStockItems.rows.length} low stock alerts`);
    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  }

  startScheduledChecks() {
    // Check overdue equipment every hour
    setInterval(() => {
      this.checkOverdueEquipment();
    }, 60 * 60 * 1000);

    // Check low stock every 6 hours
    setInterval(() => {
      this.checkLowStock();
    }, 6 * 60 * 60 * 1000);

    console.log('Alert service scheduled checks started');
  }
}

module.exports = new AlertService();