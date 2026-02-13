import pool from '../database.js';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

export const createSchoolSampleData = async (schoolCode, client = null) => {
  const shouldReleaseClient = !client;
  if (!client) {
    client = await pool.connect();
  }
  
  try {
    const schemaName = `school_${schoolCode.toLowerCase()}`;
    
    // Check if sample data already exists
    const existingEquipment = await client.query(`SELECT COUNT(*) FROM "${schemaName}".equipment`);
    
    if (parseInt(existingEquipment.rows[0].count) === 0) {
      console.log(`🔧 Creating sample equipment data for ${schoolCode}...`);
      
      const sampleEquipment = [
        { name: 'MacBook Pro 16"', type: 'Laptop', serial_number: `${schoolCode}-MBP001`, condition: 'excellent', status: 'available', location: 'IT Lab A' },
        { name: 'Dell Monitor 27"', type: 'Monitor', serial_number: `${schoolCode}-MON001`, condition: 'good', status: 'available', location: 'Classroom 101' },
        { name: 'Epson Projector', type: 'Projector', serial_number: `${schoolCode}-PROJ001`, condition: 'good', status: 'checked_out', location: 'Auditorium' },
        { name: 'iPad Pro 12.9"', type: 'Tablet', serial_number: `${schoolCode}-IPD001`, condition: 'excellent', status: 'available', location: 'Media Center' },
        { name: 'Canon DSLR Camera', type: 'Camera', serial_number: `${schoolCode}-CAM001`, condition: 'good', status: 'available', location: 'Photography Lab' },
        { name: 'HP Laser Printer', type: 'Printer', serial_number: `${schoolCode}-PRT001`, condition: 'fair', status: 'under_repair', location: 'Office' },
        { name: 'Microsoft Surface', type: 'Laptop', serial_number: `${schoolCode}-SUR001`, condition: 'excellent', status: 'available', location: 'IT Lab B' },
        { name: 'Smart Board 75"', type: 'Display', serial_number: `${schoolCode}-SB001`, condition: 'good', status: 'available', location: 'Classroom 102' },
        { name: 'Audio Interface', type: 'Audio', serial_number: `${schoolCode}-AUD001`, condition: 'excellent', status: 'checked_out', location: 'Music Room' },
        { name: 'Network Switch', type: 'Network', serial_number: `${schoolCode}-NET001`, condition: 'good', status: 'available', location: 'Server Room' }
      ];

      for (const item of sampleEquipment) {
        // Generate QR code for the equipment
        const qrCodeData = `SchoolSync-${item.serial_number}`;
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
        const description = `QR Code: ${qrCodeData}\nSerial: ${item.serial_number}\nLocation: ${item.location}`;
        
        await client.query(
          `INSERT INTO "${schemaName}".equipment (name, type, serial_number, condition_status, status, location, description, qr_code) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [item.name, item.type, item.serial_number, item.condition, item.status, item.location, description, qrCodeUrl]
        );
      }

      console.log(`✅ Sample equipment data created for ${schoolCode} with QR codes`);
    }

    // Create sample admin user if doesn't exist
    const existingAdmin = await client.query(`SELECT COUNT(*) FROM "${schemaName}".users WHERE role = 'admin'`);
    
    if (parseInt(existingAdmin.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await client.query(
        `INSERT INTO "${schemaName}".users (username, email, password, role, grade_level, subject_specialization, password_set) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`admin_${schoolCode.toLowerCase()}`, `admin@${schoolCode.toLowerCase()}.school`, hashedPassword, 'admin', 'Administrator', 'System Administration', true]
      );

      console.log(`✅ Sample admin created for ${schoolCode}: admin@${schoolCode.toLowerCase()}.school / admin123`);
    }

    // Create sample student user if doesn't exist
    const existingStudent = await client.query(`SELECT COUNT(*) FROM "${schemaName}".users WHERE role = 'student'`);
    
    if (parseInt(existingStudent.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('student123', 12);
      
      await client.query(
        `INSERT INTO "${schemaName}".users (username, email, password, role, grade_level, password_set) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`student_${schoolCode.toLowerCase()}`, `student@${schoolCode.toLowerCase()}.school`, hashedPassword, 'student', '10th Grade', true]
      );

      console.log(`✅ Sample student created for ${schoolCode}: student@${schoolCode.toLowerCase()}.school / student123`);
    }
  } finally {
    if (shouldReleaseClient) {
      client.release();
    }
  }
};

