require('dotenv').config();
const db = require('../src/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('📦 Running key sharing migration...');
    
    const sqlPath = path.join(__dirname, 'add_key_sharing.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await db.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('   - Created doctor_authorizations table');
    console.log('   - Added El Gamal key columns to doctors table');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
