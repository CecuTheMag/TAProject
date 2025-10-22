import pool from '../database.js';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

export const createSampleData = async () => {
  try {
    // Check if sample data already exists
    const existingEquipment = await pool.query('SELECT COUNT(*) FROM equipment');
    
    if (parseInt(existingEquipment.rows[0].count) === 0) {
      console.log('🔧 Creating sample equipment data...');
      
      const sampleEquipment = [
        { name: 'MacBook Pro 16"', type: 'Laptop', serial_number: 'MBP001', condition: 'excellent', status: 'available', location: 'IT Lab A' },
        { name: 'Dell Monitor 27"', type: 'Monitor', serial_number: 'MON001', condition: 'good', status: 'available', location: 'Classroom 101' },
        { name: 'Epson Projector', type: 'Projector', serial_number: 'PROJ001', condition: 'good', status: 'available', location: 'Auditorium' },
        { name: 'iPad Pro 12.9"', type: 'Tablet', serial_number: 'IPD001', condition: 'excellent', status: 'available', location: 'Media Center' },
        { name: 'Canon DSLR Camera', type: 'Camera', serial_number: 'CAM001', condition: 'good', status: 'available', location: 'Photography Lab' },
        { name: 'HP Laser Printer', type: 'Printer', serial_number: 'PRT001', condition: 'fair', status: 'available', location: 'Office' },
        { name: 'Microsoft Surface', type: 'Laptop', serial_number: 'SUR001', condition: 'excellent', status: 'available', location: 'IT Lab B' },
        { name: 'Smart Board 75"', type: 'Display', serial_number: 'SB001', condition: 'good', status: 'available', location: 'Classroom 102' },
        { name: 'Audio Interface', type: 'Audio', serial_number: 'AUD001', condition: 'excellent', status: 'available', location: 'Music Room' },
        { name: 'Network Switch', type: 'Network', serial_number: 'NET001', condition: 'good', status: 'available', location: 'Server Room' }
      ];

      for (const item of sampleEquipment) {
        // Generate QR code for the equipment
        const qrCodeData = `SIMS-${item.serial_number}`;
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
        const description = `QR Code: ${qrCodeData}\nSerial: ${item.serial_number}\nLocation: ${item.location}`;
        
        await pool.query(
          `INSERT INTO equipment (name, type, serial_number, condition, status, location, requires_approval, description, qr_code) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [item.name, item.type, item.serial_number, item.condition, item.status, item.location, false, description, qrCodeUrl]
        );
      }

      console.log('✅ Sample equipment data created successfully with QR codes');
    }

    // Create sample user if doesn't exist
    const existingUser = await pool.query('SELECT COUNT(*) FROM users WHERE username = $1', ['testuser']);
    
    if (parseInt(existingUser.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        ['testuser', 'test@school.edu', hashedPassword, 'student']
      );

      console.log('✅ Sample user created: test@school.edu / password123');
    }

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
};