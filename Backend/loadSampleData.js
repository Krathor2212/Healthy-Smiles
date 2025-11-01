const fs = require('fs');
const db = require('./src/db');

async function loadSampleData() {
  try {
    console.log('📂 Reading sample data file...');
    const sql = fs.readFileSync('./db/sample_data.sql', 'utf8');
    
    console.log('💾 Loading sample data into database...');
    await db.query(sql);
    
    // Verify data was loaded
    const doctorsCount = await db.query('SELECT COUNT(*) FROM doctors_data');
    const medicinesCount = await db.query('SELECT COUNT(*) FROM medicines');
    const hospitalsCount = await db.query('SELECT COUNT(*) FROM hospitals');
    const articlesCount = await db.query('SELECT COUNT(*) FROM articles');
    
    console.log('\n✅ Sample data loaded successfully!\n');
    console.log('📊 Database Statistics:');
    console.log(`   - Doctors: ${doctorsCount.rows[0].count}`);
    console.log(`   - Medicines: ${medicinesCount.rows[0].count}`);
    console.log(`   - Hospitals: ${hospitalsCount.rows[0].count}`);
    console.log(`   - Articles: ${articlesCount.rows[0].count}`);
    console.log('\n🎉 You can now restart the app to see the data!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error loading sample data:', err.message);
    console.error('\nMake sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database "healthy_smiles" exists');
    console.error('3. Tables are created (run migration_v1.sql first)');
    process.exit(1);
  }
}

loadSampleData();
