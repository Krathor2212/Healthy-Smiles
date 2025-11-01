require('dotenv').config();
const db = require('../src/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('📦 Running access requests and audit log migration...');
    
    const sqlPath = path.join(__dirname, 'add_access_requests_and_audit.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await db.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('   - Created access_requests table');
    console.log('   - Created authorization_audit_log table');
    console.log('   - Created notifications table');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

runMigration();
