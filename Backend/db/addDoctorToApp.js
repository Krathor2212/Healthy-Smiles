// Add doctor to doctors_data table for mobile app
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addDoctorToApp() {
  try {
    console.log('Adding Dr. John Smith to doctors_data table...\n');

    const doctorData = {
      id: 'dr-john-smith-1',
      name: 'Dr. John Smith',
      specialty: 'General Physician',
      rating: 4.8,
      reviews_count: 127,
      experience: '15 years',
      distance: '2.5 km',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      about: 'Dr. John Smith is a highly experienced General Physician with over 15 years of practice. He specializes in preventive care, chronic disease management, and family medicine.',
      hospital: 'City General Hospital',
      hospital_id: 'hospital-1',
      consultation_fee: 500,
      availability: JSON.stringify({
        monday: ['09:00-12:00', '14:00-18:00'],
        tuesday: ['09:00-12:00', '14:00-18:00'],
        wednesday: ['09:00-12:00', '14:00-18:00'],
        thursday: ['09:00-12:00', '14:00-18:00'],
        friday: ['09:00-12:00', '14:00-18:00'],
        saturday: ['09:00-13:00']
      }),
      categories: JSON.stringify(['General', 'Family Medicine', 'Preventive Care'])
    };

    // Check if doctor already exists
    const existing = await pool.query(
      'SELECT id FROM doctors_data WHERE id = $1',
      [doctorData.id]
    );

    if (existing.rows.length > 0) {
      console.log('✅ Doctor already exists in doctors_data table');
      console.log('\nDoctor Details:');
      console.log('ID:', doctorData.id);
      console.log('Name:', doctorData.name);
      console.log('Specialty:', doctorData.specialty);
      console.log('Hospital:', doctorData.hospital);
      await pool.end();
      return;
    }

    // Insert doctor
    await pool.query(
      `INSERT INTO doctors_data (
        id, name, specialty, rating, reviews_count, experience, 
        distance, image, about, hospital, hospital_id, 
        consultation_fee, availability, categories
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        doctorData.id,
        doctorData.name,
        doctorData.specialty,
        doctorData.rating,
        doctorData.reviews_count,
        doctorData.experience,
        doctorData.distance,
        doctorData.image,
        doctorData.about,
        doctorData.hospital,
        doctorData.hospital_id,
        doctorData.consultation_fee,
        doctorData.availability,
        doctorData.categories
      ]
    );

    console.log('✅ Successfully added Dr. John Smith to doctors_data table!\n');
    console.log('Doctor Details:');
    console.log('ID:', doctorData.id);
    console.log('Name:', doctorData.name);
    console.log('Specialty:', doctorData.specialty);
    console.log('Rating:', doctorData.rating);
    console.log('Reviews:', doctorData.reviews_count);
    console.log('Experience:', doctorData.experience);
    console.log('Hospital:', doctorData.hospital);
    console.log('Consultation Fee: ₹' + doctorData.consultation_fee);
    console.log('\n✨ The doctor should now be visible in the Medics mobile app!');

    await pool.end();
  } catch (err) {
    console.error('Error adding doctor:', err);
    await pool.end();
    process.exit(1);
  }
}

addDoctorToApp();
