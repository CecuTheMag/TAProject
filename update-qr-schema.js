// Update QR code column in all school schemas to support full data URLs
import pool from './backend/database.js';

const updateQRCodeColumns = async () => {
  const client = await pool.connect();
  try {
    // Get all schools
    const schools = await client.query('SELECT code FROM schools WHERE code IS NOT NULL');
    
    console.log(`Found ${schools.rows.length} schools to update`);
    
    for (const school of schools.rows) {
      const schemaName = `school_${school.code}`;
      
      try {
        // Check if schema exists
        const schemaExists = await client.query(
          `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
          [schemaName]
        );
        
        if (schemaExists.rows.length > 0) {
          // Update qr_code column to TEXT to support full data URLs
          await client.query(`
            ALTER TABLE "${schemaName}".equipment 
            ALTER COLUMN qr_code TYPE TEXT
          `);
          
          console.log(`✅ Updated QR code column for school: ${school.code}`);
        } else {
          console.log(`⚠️  Schema not found for school: ${school.code}`);
        }
      } catch (error) {
        console.log(`⚠️  Error updating school ${school.code}:`, error.message);
      }
    }
    
    console.log('QR code column updates completed');
  } catch (error) {
    console.error('❌ Failed to update QR code columns:', error);
  } finally {
    client.release();
    process.exit(0);
  }
};

updateQRCodeColumns();