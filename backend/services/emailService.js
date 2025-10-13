import nodemailer from 'nodemailer';

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

export default new EmailService();