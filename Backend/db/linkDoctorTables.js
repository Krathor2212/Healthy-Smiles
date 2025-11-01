// Link Dr. John Smith from doctors table to doctors_data table
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function linkDoctorTables() {
  try {
    console.log('Linking doctors and doctors_data tables...\n');

    // First, run the migration to add doctor_id column
    console.log('Step 1: Adding doctor_id column to doctors_data...');
    await pool.query(`
      ALTER TABLE doctors_data ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_doctors_data_doctor_id ON doctors_data(doctor_id)
    `);
    console.log('✅ Column added successfully\n');

    // Get the doctor ID from doctors table
    console.log('Step 2: Finding Dr. John Smith in doctors table...');
    const doctorAuth = await pool.query(`
      SELECT id FROM doctors LIMIT 1
    `);

    if (doctorAuth.rows.length === 0) {
      console.log('❌ No doctor found in doctors table. Please create a doctor account first.');
      await pool.end();
      return;
    }

    const doctorId = doctorAuth.rows[0].id;
    console.log('✅ Found doctor ID:', doctorId);

    // Update doctors_data to link to this doctor
    console.log('\nStep 3: Linking doctors_data record to doctors table...');
    const result = await pool.query(`
      UPDATE doctors_data 
      SET doctor_id = $1 
      WHERE id = 'dr-john-smith-1'
      RETURNING *
    `, [doctorId]);

    if (result.rows.length > 0) {
      console.log('✅ Successfully linked Dr. John Smith!');
      console.log('\nLinked Doctor:');
      console.log('ID:', result.rows[0].id);
      console.log('Name:', result.rows[0].name);
      console.log('Doctor Auth ID:', result.rows[0].doctor_id);
      console.log('\n✨ Now the doctor in mobile app is linked to the authentication account!');
    } else {
      console.log('❌ Could not find dr-john-smith-1 in doctors_data');
    }

    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

linkDoctorTables();
