require('dotenv').config();
const db = require('../src/db');

async function grantTestAuthorization() {
  try {
    console.log('🔐 Granting test authorization...\n');

    // Get patient ID (you can change this)
    const patientResult = await db.query(
      'SELECT id, name_enc FROM patients LIMIT 1'
    );
    
    if (patientResult.rows.length === 0) {
      console.log('❌ No patients found in database');
      process.exit(1);
    }

    const patient = patientResult.rows[0];
    console.log(`📋 Patient: ${patient.id}`);

    // Get doctor ID
    const doctorResult = await db.query(
      'SELECT id, name_enc FROM doctors LIMIT 1'
    );
    
    if (doctorResult.rows.length === 0) {
      console.log('❌ No doctors found in database');
      process.exit(1);
    }

    const doctor = doctorResult.rows[0];
    console.log(`👨‍⚕️ Doctor: ${doctor.id}\n`);

    // For testing, we'll create a simple authorization
    // In production, this should go through the proper authorization controller
    const result = await db.query(
      `INSERT INTO doctor_authorizations (patient_id, doctor_id, shared_key_enc, is_active, expires_at)
       VALUES ($1, $2, 
         (SELECT elgamal_private_key_enc FROM patients WHERE id = $1),
         true,
         NOW() + INTERVAL '30 days'
       )
       ON CONFLICT (patient_id, doctor_id) 
       DO UPDATE SET 
         is_active = true,
         authorized_at = NOW(),
         expires_at = NOW() + INTERVAL '30 days'
       RETURNING id, authorized_at, expires_at`,
      [patient.id, doctor.id]
    );

    const auth = result.rows[0];
    
    console.log('✅ Authorization granted successfully!');
    console.log(`   Authorization ID: ${auth.id}`);
    console.log(`   Granted at: ${auth.authorized_at}`);
    console.log(`   Expires at: ${auth.expires_at}`);
    console.log('\n📝 Note: This is a simplified authorization for testing.');
    console.log('   In production, the patient key should be re-encrypted with doctor\'s public key.\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

grantTestAuthorization();
