/**
 * Migration script: Add push_token to patients table
 * Run with: node runMigration.js
 */

const { Client } = require('pg');

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthy_smiles',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '9133'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Add push_token column
    await client.query(`
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS push_token TEXT;
    `);
    console.log('✓ Added push_token column to patients table');

    // Add index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_patients_push_token 
      ON patients(push_token) WHERE push_token IS NOT NULL;
    `);
    console.log('✓ Created index on push_token column');

    // Add comment
    await client.query(`
      COMMENT ON COLUMN patients.push_token IS 'Expo push notification token for sending mobile notifications';
    `);
    console.log('✓ Added column comment');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
