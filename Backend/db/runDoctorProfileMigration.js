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
    console.log('🔄 Starting doctor profile fields migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migration_add_doctor_profile_fields.sql'),
      'utf8'
    );

    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');

    console.log('✅ Doctor profile fields migration completed successfully!');
    
    // Verify the new columns
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'doctors' 
      AND column_name IN ('phone_enc', 'qualifications_enc', 'experience_enc', 'hospital_enc', 'address_enc', 'bio_enc')
      ORDER BY column_name;
    `);
    
    console.log('\n📋 New columns added:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    
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
