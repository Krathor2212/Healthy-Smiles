require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../src/db');

async function checkAndFixData() {
  const client = await db.pool.connect();
  
  try {
    console.log('Checking database data...\n');
    
    // Check doctors
    const doctorsResult = await client.query(`
      SELECT id, name_enc, email_enc, specialty_enc, role 
      FROM doctors 
      ORDER BY created_at
    `);
    console.log(`Total doctors in DB: ${doctorsResult.rows.length}`);
    doctorsResult.rows.forEach((d, idx) => {
      console.log(`  ${idx + 1}. ID: ${d.id}, Role: ${d.role || 'doctor'}`);
    });
    
    // Check patients
    const patientsResult = await client.query('SELECT COUNT(*) FROM patients');
    console.log(`\nTotal patients: ${patientsResult.rows[0].count}`);
    
    // Check medicines
    const medicinesResult = await client.query('SELECT COUNT(*) FROM medicines');
    console.log(`Total medicines: ${medicinesResult.rows[0].count}`);
    
    // Check hospitals
    const hospitalsResult = await client.query('SELECT id, name FROM hospitals ORDER BY id');
    console.log(`\nTotal hospitals: ${hospitalsResult.rows.length}`);
    hospitalsResult.rows.forEach(h => {
      console.log(`  - ${h.name} (ID: ${h.id})`);
    });
    
    // Check hospital assignments
    const assignmentsResult = await client.query(`
      SELECT ha.doctor_id, h.name as hospital_name
      FROM hospital_assignments ha
      JOIN hospitals h ON ha.hospital_id = h.id
    `);
    console.log(`\nTotal hospital assignments: ${assignmentsResult.rows.length}`);
    assignmentsResult.rows.forEach(a => {
      console.log(`  - Doctor ${a.doctor_id} -> ${a.hospital_name}`);
    });
    
    // Find John Smith
    const { decryptText } = require('../src/cryptoUtil');
    const johnSmith = doctorsResult.rows.find(d => {
      try {
        const name = d.name_enc ? decryptText(d.name_enc) : '';
        return name.toLowerCase().includes('john') || name.toLowerCase().includes('smith');
      } catch (e) {
        return false;
      }
    });
    
    if (johnSmith) {
      console.log(`\n✓ Found John Smith with ID: ${johnSmith.id}`);
      
      // Check if John Smith has role set
      if (!johnSmith.role || johnSmith.role !== 'doctor') {
        console.log('  Fixing role...');
        await client.query(`UPDATE doctors SET role = 'doctor' WHERE id = $1`, [johnSmith.id]);
        console.log('  ✓ Role updated to doctor');
      }
    } else {
      console.log('\n✗ John Smith not found in database');
    }
    
    // Delete all doctors except John Smith and admins
    if (johnSmith) {
      console.log('\nDeleting other doctors (keeping John Smith and admins)...');
      const deleteResult = await client.query(`
        DELETE FROM doctors 
        WHERE id != $1 
        AND (role IS NULL OR role = 'doctor')
        RETURNING id
      `, [johnSmith.id]);
      console.log(`✓ Deleted ${deleteResult.rows.length} doctors`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

checkAndFixData().catch(console.error);
