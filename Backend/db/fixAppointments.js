// Fix appointments - link text doctor IDs to UUID doctor IDs
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixAppointments() {
  try {
    console.log('Fixing appointment doctor_id linkage...\n');

    // Get the mapping of doctor_data.id to doctors.id
    const mapping = await pool.query(`
      SELECT dd.id as data_id, d.id as auth_id, dd.name
      FROM doctors_data dd
      INNER JOIN doctors d ON dd.doctor_id = d.id
      WHERE dd.doctor_id IS NOT NULL
    `);

    if (mapping.rows.length === 0) {
      console.log('❌ No linked doctors found. Please link doctors first.');
      await pool.end();
      return;
    }

    console.log('Found linked doctors:');
    mapping.rows.forEach(m => {
      console.log(`  - ${m.name}: ${m.data_id} → ${m.auth_id}`);
    });
    console.log('');

    // Update appointments for each mapped doctor
    let totalUpdated = 0;
    for (const m of mapping.rows) {
      const result = await pool.query(`
        UPDATE appointments
        SET doctor_id = $1
        WHERE doctor_id = $2
        RETURNING id
      `, [m.auth_id, m.data_id]);

      if (result.rows.length > 0) {
        console.log(`✅ Updated ${result.rows.length} appointments for ${m.name}`);
        totalUpdated += result.rows.length;
      }
    }

    console.log(`\n✨ Total appointments updated: ${totalUpdated}`);

    // Show current appointments
    console.log('\nCurrent appointments:');
    const appointments = await pool.query(`
      SELECT a.id, a.doctor_id, a.doctor_name, a.appointment_date, a.appointment_time, a.status
      FROM appointments a
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    appointments.rows.forEach((apt, i) => {
      console.log(`${i + 1}. ${apt.doctor_name} on ${apt.appointment_date} at ${apt.appointment_time}`);
      console.log(`   Doctor ID: ${apt.doctor_id} (${apt.doctor_id.length > 20 ? 'UUID ✓' : 'Text ID'})`);
      console.log(`   Status: ${apt.status}`);
    });

    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    await pool.end();
  }
}

fixAppointments();
