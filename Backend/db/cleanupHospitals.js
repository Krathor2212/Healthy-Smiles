require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../src/db');

async function cleanupHospitals() {
  const client = await db.pool.connect();
  
  try {
    console.log('Starting hospitals cleanup...');
    
    await client.query('BEGIN');
    
    // Delete all existing hospital assignments
    await client.query('DELETE FROM hospital_assignments');
    console.log('✓ Cleared all hospital assignments');
    
    // Delete all existing hospitals
    await client.query('DELETE FROM hospitals');
    console.log('✓ Deleted all existing hospitals');
    
    // Insert only the 3 required hospitals
    await client.query(`
      INSERT INTO hospitals (id, name, speciality, rating, distance, latitude, longitude, reviews_count, emergency, image)
      VALUES 
        ('1', 'Apollo Hospitals', 'Multi-Speciality', 4.7, '2.5km away', 13.0067, 80.2206, 1250, true, '/hospitals/apollo.jpg'),
        ('2', 'MIOT International Hospital', 'Multi-Speciality', 4.6, '3.2km away', 13.0186, 80.2309, 980, true, '/hospitals/miot.jpg'),
        ('3', 'Prashanth Hospital', 'Multi-Speciality', 4.5, '1.8km away', 12.9982, 80.2172, 750, true, '/hospitals/prashanth.jpg')
    `);
    console.log('✓ Inserted 3 hospitals');
    
    // Verify hospitals
    const result = await client.query('SELECT id, name, speciality, rating FROM hospitals ORDER BY id');
    console.log('\n✓ Final hospitals in database:');
    result.rows.forEach(h => {
      console.log(`  - ${h.name} (ID: ${h.id}) - ${h.speciality} - Rating: ${h.rating}`);
    });
    
    await client.query('COMMIT');
    console.log('\n✓ Hospitals cleanup completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Cleanup failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

cleanupHospitals().catch(console.error);
