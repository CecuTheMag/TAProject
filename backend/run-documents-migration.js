import pool from './database.js';

async function addDocumentsColumn() {
  try {
    console.log('Adding documents column to equipment tables...');
    
    // Get all school schemas
    const schemasResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'school_%'
    `);
    
    console.log(`Found ${schemasResult.rows.length} school schemas`);
    
    for (const schema of schemasResult.rows) {
      const schemaName = schema.schema_name;
      
      try {
        // Check if column exists
        const columnCheck = await pool.query(`
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_schema = $1
          AND table_name = 'equipment' 
          AND column_name = 'documents'
        `, [schemaName]);
        
        if (columnCheck.rows.length === 0) {
          // Add documents column
          await pool.query(`
            ALTER TABLE "${schemaName}".equipment 
            ADD COLUMN documents JSONB DEFAULT '[]'::jsonb
          `);
          console.log(`✅ Added documents column to ${schemaName}.equipment`);
        } else {
          console.log(`⏭️  documents column already exists in ${schemaName}.equipment`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${schemaName}:`, error.message);
      }
    }
    
    // Also check public schema
    try {
      const publicCheck = await pool.query(`
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'equipment' 
        AND column_name = 'documents'
      `);
      
      if (publicCheck.rows.length === 0) {
        await pool.query(`
          ALTER TABLE public.equipment 
          ADD COLUMN documents JSONB DEFAULT '[]'::jsonb
        `);
        console.log('✅ Added documents column to public.equipment');
      }
    } catch (error) {
      console.error('❌ Error updating public schema:', error.message);
    }
    
    console.log('\nMigration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addDocumentsColumn();
