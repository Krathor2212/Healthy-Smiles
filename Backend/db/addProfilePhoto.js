require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../src/db');

async function addProfilePhoto() {
  const client = await db.pool.connect();
  
  try {
    console.log('Adding profile_photo column to doctors table...');
    
    await client.query('BEGIN');
    
    // Add profile_photo column
    await client.query(`
      ALTER TABLE doctors 
      ADD COLUMN IF NOT EXISTS profile_photo TEXT
    `);
    
    console.log('✓ Added profile_photo column');
    
    await client.query('COMMIT');
    console.log('✓ Migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

addProfilePhoto().catch(console.error);
