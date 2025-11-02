const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Starting profile completion migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migration_add_profile_completed.sql'),
      'utf8'
    );

    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');

    console.log('✅ Profile completion migration completed successfully!');
    
    // Verify the new column
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'patients' 
      AND column_name = 'profile_completed';
    `);
    
    if (result.rows.length > 0) {
      console.log('\n📋 Column added:');
      console.log(`   - ${result.rows[0].column_name} (${result.rows[0].data_type}) default: ${result.rows[0].column_default}`);
    }
    
    // Count patients
    const countResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE profile_completed = TRUE) as completed,
        COUNT(*) FILTER (WHERE profile_completed = FALSE) as incomplete
      FROM patients;
    `);
    
    console.log('\n📊 Patient Profile Status:');
    console.log(`   - Total patients: ${countResult.rows[0].total}`);
    console.log(`   - Completed profiles: ${countResult.rows[0].completed}`);
    console.log(`   - Incomplete profiles: ${countResult.rows[0].incomplete}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
