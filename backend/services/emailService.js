import nodemailer from 'nodemailer';
import pool from '../database.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'kironotificatora@gmail.com',
        pass: 'eieo fqhh rfcc tgsa'
      }
    });
  }

  async checkAndSendOverdueReminders() {
    try {
      // Skip if no schools exist yet
      const schoolsResult = await pool.query('SELECT code FROM schools LIMIT 1');
      if (!schoolsResult.rows.length) {
        console.log('No schools found, skipping reminder check');
        return 0;
      }

      let totalReminders = 0;
      
      // Check each school schema
      for (const school of schoolsResult.rows) {
        const schema = `school_${school.code}`;
        
        const overdueQuery = `
          SELECT r.id, r.due_date, u.email, u.username, e.name as equipment_name
          FROM "${schema}".requests r
          JOIN "${schema}".users u ON r.user_id = u.id
          JOIN "${schema}".equipment e ON r.equipment_id = e.id
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
            `UPDATE "${schema}".requests SET reminder_sent = NOW() WHERE id = $1`,
            [request.id]
          );
        }
        
        totalReminders += result.rows.length;
      }
      
      if (totalReminders > 0) {
        console.log(`✅ Sent ${totalReminders} overdue reminders`);
      }
      return totalReminders;
    } catch (error) {
      console.error('❌ Error checking overdue reminders:', error.message);
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
      from: 'kironotificatora@gmail.com',
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
          <p>Thank you,<br>AssetFlow Team</p>
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

  async sendRequestApprovalNotification(userEmail, equipmentName, approvedBy) {
    const mailOptions = {
      from: 'kironotificatora@gmail.com',
      to: userEmail,
      subject: `Request Approved - ${equipmentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Request Approved</h2>
          <p>Dear User,</p>
          <p>Your equipment request has been approved!</p>
          <div style="background: #d1fae5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <strong>Equipment:</strong> ${equipmentName}<br>
            <strong>Approved by:</strong> ${approvedBy}
          </div>
          <p>You can now collect your equipment. Please return it by the due date.</p>
          <p>Thank you,<br>AssetFlow Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Approval notification sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send approval email:', error);
    }
  }

  async sendLowStockAlert(adminEmail, equipmentName, currentStock, threshold) {
    const mailOptions = {
      from: 'kironotificatora@gmail.com',
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
          <p>Best regards,<br>AssetFlow System</p>
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

  async sendVerificationCode(userEmail, code, userName) {
    const mailOptions = {
      from: 'kironotificatora@gmail.com',
      to: userEmail,
      subject: 'AssetFlow - Account Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Welcome to AssetFlow, ${userName}!</h2>
          <p>Your account has been created. To complete your registration, please use the verification code below:</p>
          <div style="background: #f8fafc; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #1d4ed8; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Thank you,<br>AssetFlow Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification code sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }
}

const emailService = new EmailService();
export default emailService;