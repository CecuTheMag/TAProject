// Regenerate QR codes for existing equipment
import pool from './backend/database.js';
import QRCode from 'qrcode';

const regenerateQRCodes = async () => {
  const client = await pool.connect();
  try {
    // Get all schools
    const schools = await client.query('SELECT code FROM schools WHERE code IS NOT NULL');
    
    console.log(`Processing ${schools.rows.length} schools`);
    
    for (const school of schools.rows) {
      const schemaName = `school_${school.code}`;
      
      try {
        // Check if schema exists
        const schemaExists = await client.query(
          `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
          [schemaName]
        );
        
        if (schemaExists.rows.length > 0) {
          // Get equipment with serial numbers but invalid QR codes
          const equipment = await client.query(`
            SELECT id, serial_number, qr_code 
            FROM "${schemaName}".equipment 
            WHERE serial_number IS NOT NULL 
            AND (qr_code IS NULL OR LENGTH(qr_code) < 100)
          `);
          
          console.log(`Found ${equipment.rows.length} items to update in ${school.code}`);
          
          for (const item of equipment.rows) {
            try {
              // Generate new QR code
              const qrCode = await QRCode.toDataURL(item.serial_number);
              
              // Update the equipment record
              await client.query(`
                UPDATE "${schemaName}".equipment 
                SET qr_code = $1 
                WHERE id = $2
              `, [qrCode, item.id]);
              
              console.log(`✅ Updated QR code for ${item.serial_number}`);
            } catch (qrError) {
              console.error(`❌ Failed to generate QR for ${item.serial_number}:`, qrError.message);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️  Error processing school ${school.code}:`, error.message);
      }
    }
    
    console.log('QR code regeneration completed');
  } catch (error) {
    console.error('❌ Failed to regenerate QR codes:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

regenerateQRCodes();