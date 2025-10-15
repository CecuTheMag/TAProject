import nodemailer from 'nodemailer';
import pool from '../database.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'sims@tech.academy',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  async checkAndSendOverdueReminders() {
    try {
      const overdueQuery = `
        SELECT r.id, r.due_date, u.email, u.username, e.name as equipment_name
        FROM requests r
        JOIN users u ON r.user_id = u.id
        JOIN equipment e ON r.equipment_id = e.id
        WHERE r.status = 'approved' 
        AND r.due_date < NOW()
        AND (r.reminder_sent IS NULL OR r.reminder_sent < NOW() - INTERVAL '1 day')
      `;
      
      const result = await pool.query(overdueQuery);
      
      for (const request of result.rows) {
        await this.sendOverdueReminder(
          request.email,
          request.equipment_name,
          request.due_date
        );
        
        await pool.query(
          'UPDATE requests SET reminder_sent = NOW() WHERE id = $1',
          [request.id]
        );
      }
      
      console.log(`✅ Sent ${result.rows.length} overdue reminders`);
      return result.rows.length;
    } catch (error) {
      console.error('❌ Error checking overdue reminders:', error);
      return 0;
    }
  }

  async startReminderScheduler() {
    setInterval(async () => {
      await this.checkAndSendOverdueReminders();
    }, 60 * 60 * 1000);
    
    await this.checkAndSendOverdueReminders();
    console.log('📧 Email reminder scheduler started');
  }

  async sendOverdueReminder(userEmail, equipmentName, dueDate) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'sims@tech.academy',
      to: userEmail,
      subject: `Equipment Return Reminder - ${equipmentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Equipment Return Reminder</h2>
          <p>Dear User,</p>
          <p>This is a reminder that the following equipment is overdue for return:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <strong>Equipment:</strong> ${equipmentName}<br>
            <strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}
          </div>
          <p>Please return the equipment as soon as possible to avoid any penalties.</p>
          <p>Thank you,<br>SIMS Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Overdue reminder sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  async sendLowStockAlert(adminEmail, equipmentName, currentStock, threshold) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'sims@tech.academy',
      to: adminEmail,
      subject: `Low Stock Alert - ${equipmentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Low Stock Alert</h2>
          <p>Dear Administrator,</p>
          <p>The following equipment is running low on stock:</p>
          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <strong>Equipment:</strong> ${equipmentName}<br>
            <strong>Current Stock:</strong> ${currentStock}<br>
            <strong>Threshold:</strong> ${threshold}
          </div>
          <p>Please consider restocking this equipment soon.</p>
          <p>Best regards,<br>SIMS System</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Low stock alert sent to ${adminEmail}`);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}

const emailService = new EmailService();
export default emailService;