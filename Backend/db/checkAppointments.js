// Check and fix appointments linking
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:1234@localhost:5432/healthy_smiles'
});

async function checkAppointments() {
  try {
    console.log('Checking appointments...\n');
    
    // Get the real doctor UUID from doctors table
    const doctorResult = await pool.query(`
      SELECT id FROM doctors LIMIT 1
    `);
    
    if (doctorResult.rows.length === 0) {
      console.log('❌ No doctor found in doctors table');
      await pool.end();
      return;
    }
    
    const realDoctorId = doctorResult.rows[0].id;
    console.log('Real Doctor ID (UUID):', realDoctorId);
    console.log('');
    
    // Check appointments
    const appointments = await pool.query(`
      SELECT id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, created_at
      FROM appointments
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`Found ${appointments.rows.length} recent appointments:\n`);
    
    if (appointments.rows.length === 0) {
      console.log('No appointments found.');
      await pool.end();
      return;
    }
    
    appointments.rows.forEach((apt, index) => {
      console.log(`${index + 1}. Appointment ID: ${apt.id}`);
      console.log(`   Patient ID: ${apt.patient_id}`);
      console.log(`   Doctor ID: ${apt.doctor_id}`);
      console.log(`   Date: ${apt.appointment_date}`);
      console.log(`   Time: ${apt.appointment_time}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Reason: ${apt.reason}`);
      console.log(`   Created: ${apt.created_at}`);
      console.log('');
    });
    
    // Check if appointments are using the text ID instead of UUID
    const wrongDoctorId = await pool.query(`
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE doctor_id::text = 'dr-john-smith-1'
    `);
    
    if (parseInt(wrongDoctorId.rows[0].count) > 0) {
      console.log(`⚠️  Found ${wrongDoctorId.rows[0].count} appointments with text doctor_id 'dr-john-smith-1'`);
      console.log('These need to be updated to use the UUID from doctors table\n');
      
      console.log('Updating appointments to use correct doctor UUID...');
      const updateResult = await pool.query(`
        UPDATE appointments 
        SET doctor_id = $1 
        WHERE doctor_id::text = 'dr-john-smith-1'
        RETURNING id
      `, [realDoctorId]);
      
      console.log(`✅ Updated ${updateResult.rows.length} appointments to use doctor UUID: ${realDoctorId}\n`);
    } else {
      // Check if any appointments exist for the real doctor ID
      const correctAppts = await pool.query(`
        SELECT COUNT(*) as count 
        FROM appointments 
        WHERE doctor_id = $1
      `, [realDoctorId]);
      
      console.log(`✅ ${correctAppts.rows[0].count} appointments are correctly linked to doctor UUID: ${realDoctorId}\n`);
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    await pool.end();
  }
}

checkAppointments();
