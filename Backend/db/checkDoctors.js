// Test script to check doctors_data
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:1234@localhost:5432/healthy_smiles'
});

async function checkDoctors() {
  try {
    console.log('Checking doctors_data table...\n');
    
    const result = await pool.query(`
      SELECT id, name, specialty, rating, reviews_count, experience, consultation_fee, doctor_id
      FROM doctors_data
      ORDER BY name
    `);
    
    console.log(`Found ${result.rows.length} doctors:\n`);
    
    result.rows.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.name}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Specialty: ${doc.specialty}`);
      console.log(`   Rating: ${doc.rating}`);
      console.log(`   Reviews: ${doc.reviews_count}`);
      console.log(`   Experience: ${doc.experience}`);
      console.log(`   Fee: ₹${doc.consultation_fee}`);
      console.log(`   Linked to auth: ${doc.doctor_id || 'No'}`);
      console.log('');
    });
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    await pool.end();
  }
}

checkDoctors();
