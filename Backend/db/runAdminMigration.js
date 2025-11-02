require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../src/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

async function runMigration() {
  const client = await db.pool.connect();
  
  try {
    console.log('Starting admin and hospitals migration...');
    
    // Read and execute the migration SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migration_add_admin_and_hospitals.sql'),
      'utf8'
    );
    
    await client.query('BEGIN');
    await client.query(migrationSQL);
    
    // Create default admin account (username: admin, password: admin123)
    const adminEmail = 'admin@healthysmiles.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const existingAdmin = await client.query(
      'SELECT id FROM admins WHERE email = $1',
      [adminEmail]
    );
    
    if (existingAdmin.rows.length === 0) {
      await client.query(
        `INSERT INTO admins (name, email, password_hash) 
         VALUES ($1, $2, $3)`,
        ['System Admin', adminEmail, hashedPassword]
      );
      console.log('✓ Created default admin account');
      console.log('  Email: admin@healthysmiles.com');
      console.log('  Password: admin123');
      console.log('  ⚠️  Please change this password after first login!');
    } else {
      console.log('✓ Admin account already exists');
    }
    
    // Verify hospitals were created
    const hospitals = await client.query('SELECT id, name FROM hospitals ORDER BY id');
    console.log(`✓ Hospitals in database: ${hospitals.rows.length}`);
    hospitals.rows.forEach(h => console.log(`  - ${h.name} (ID: ${h.id})`));
    
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

runMigration().catch(console.error);
