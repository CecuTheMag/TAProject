import pool from '../database.js';
import QRCode from 'qrcode';

export const updateMissingQRCodes = async () => {
  try {
    console.log('🔄 Updating missing QR codes for existing equipment...');
    
    // Get equipment without QR codes in description
    const result = await pool.query(`
      SELECT id, serial_number, name 
      FROM equipment 
      WHERE description IS NULL OR description = '' OR description NOT LIKE '%data:image/png;base64%'
    `);
    
    let updated = 0;
    
    for (const equipment of result.rows) {
      try {
        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(equipment.serial_number, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Update equipment with QR code
        await pool.query(
          'UPDATE equipment SET description = $1 WHERE id = $2',
          [qrCodeDataURL, equipment.id]
        );
        
        updated++;
        console.log(`✅ Updated QR code for: ${equipment.name} (${equipment.serial_number})`);
      } catch (error) {
        console.error(`❌ Failed to update QR code for ${equipment.name}:`, error);
      }
    }
    
    console.log(`🎉 Updated ${updated} equipment items with QR codes`);
    return updated;
  } catch (error) {
    console.error('❌ Error updating QR codes:', error);
    return 0;
  }
};