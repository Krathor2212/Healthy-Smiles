const db = require('../src/db');

async function testHospitalDoctors() {
  try {
    // First, get all hospitals
    console.log('=== Hospitals in Database ===');
    const hospitalsResult = await db.query('SELECT id, name FROM hospitals ORDER BY id');
    hospitalsResult.rows.forEach(h => {
      console.log(`ID: ${h.id}, Name: ${h.name}`);
    });
    
    console.log('\n=== Doctors in Database ===');
    const doctorsResult = await db.query(`
      SELECT id, name_enc, email_enc, specialty_enc, role 
      FROM doctors 
      ORDER BY created_at DESC
    `);
    console.log(`Total doctors: ${doctorsResult.rows.length}`);
    doctorsResult.rows.forEach(d => {
      console.log(`ID: ${d.id}, Role: ${d.role}`);
    });
    
    console.log('\n=== Hospital Assignments ===');
    const assignmentsResult = await db.query(`
      SELECT ha.doctor_id, ha.hospital_id, h.name as hospital_name
      FROM hospital_assignments ha
      JOIN hospitals h ON ha.hospital_id = h.id
      ORDER BY ha.hospital_id
    `);
    console.log(`Total assignments: ${assignmentsResult.rows.length}`);
    assignmentsResult.rows.forEach(a => {
      console.log(`Doctor ID: ${a.doctor_id}, Hospital: ${a.hospital_name} (ID: ${a.hospital_id})`);
    });
    
    if (assignmentsResult.rows.length === 0) {
      console.log('\n⚠️  No hospital assignments found!');
      console.log('This is why HospitalDetails returns empty doctors array.');
      console.log('\nTo fix: Use admin dashboard to assign John Smith to hospitals.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testHospitalDoctors();
