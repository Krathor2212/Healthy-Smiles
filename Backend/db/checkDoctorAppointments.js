const db = require('../src/db');

async function checkDoctorAppointments() {
  try {
    console.log('Checking Dr. John Smith appointments...\n');

    const doctorId = 'af16a688-23ea-4878-9a2b-fe63163bfc80';
    
    const r = await db.query(`
      SELECT 
        id, 
        appointment_date, 
        appointment_time, 
        doctor_id, 
        doctor_name, 
        status,
        patient_id
      FROM appointments 
      WHERE doctor_id = $1
      ORDER BY appointment_date, appointment_time
    `, [doctorId]);

    console.log(`Found ${r.rows.length} appointments:\n`);
    r.rows.forEach((row, i) => {
      console.log(`${i + 1}. Date: ${row.appointment_date.toDateString()}`);
      console.log(`   Time: ${row.appointment_time}`);
      console.log(`   Doctor: ${row.doctor_name}`);
      console.log(`   Status: ${row.status}`);
      console.log(`   Doctor ID: ${row.doctor_id}`);
      console.log(`   Patient ID: ${row.patient_id}\n`);
    });

    // Also check all appointments
    const allAppts = await db.query(`
      SELECT doctor_id, doctor_name, COUNT(*) as count
      FROM appointments
      GROUP BY doctor_id, doctor_name
      ORDER BY doctor_name
    `);

    console.log('\nAll appointments grouped by doctor:');
    allAppts.rows.forEach(row => {
      console.log(`  ${row.doctor_name}: ${row.count} appointments (ID: ${row.doctor_id})`);
    });

    await db.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDoctorAppointments();
