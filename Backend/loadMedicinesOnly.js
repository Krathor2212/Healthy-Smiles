require('dotenv').config();
const db = require('./src/db');

async function loadMedicinesOnly() {
  try {
    console.log('💊 Checking existing medicines...');
    const existingMedicines = await db.query('SELECT COUNT(*) FROM medicines');
    console.log(`   Current medicines in DB: ${existingMedicines.rows[0].count}`);
    
    if (parseInt(existingMedicines.rows[0].count) >= 5) {
      console.log('✅ Medicines already loaded!');
      return;
    }
    
    console.log('💾 Loading medicines sample data...');
    
    // Delete existing medicines to avoid conflicts
    await db.query('DELETE FROM medicines');
    
    // Insert sample medicines
    const medicinesSQL = `
      INSERT INTO medicines (id, name, price, original_price, currency, size, description, rating, reviews_count, image, category, manufacturer, prescription, stock, on_sale) VALUES
      ('m1', 'Panadol Extra', 150, 180, '₹', '20 tablets', 'Effective relief from headaches, fever, and body pains', 4.5, 189, 'https://via.placeholder.com/150', 'Pain Relief', 'GSK', false, 150, true),
      ('m2', 'Vitamin C 1000mg', 299, 299, '₹', '60 tablets', 'Immune system support and antioxidant protection', 4.7, 234, 'https://via.placeholder.com/150', 'Vitamins', 'Nature Made', false, 200, false),
      ('m3', 'Amoxicillin 500mg', 450, 450, '₹', '21 capsules', 'Antibiotic for bacterial infections', 4.3, 89, 'https://via.placeholder.com/150', 'Antibiotics', 'Cipla', true, 80, false),
      ('m4', 'Cough Syrup', 95, 120, '₹', '100ml', 'Relief from dry and wet cough', 4.2, 156, 'https://via.placeholder.com/150', 'Cold & Flu', 'Benadryl', false, 120, true),
      ('m5', 'Aspirin 100mg', 85, 100, '₹', '30 tablets', 'Pain relief and heart health support', 4.6, 267, 'https://via.placeholder.com/150', 'Pain Relief', 'Bayer', false, 180, true);
    `;
    
    await db.query(medicinesSQL);
    
    // Verify
    const doctorsCount = await db.query('SELECT COUNT(*) FROM doctors_data');
    const medicinesCount = await db.query('SELECT COUNT(*) FROM medicines');
    const hospitalsCount = await db.query('SELECT COUNT(*) FROM hospitals');
    const articlesCount = await db.query('SELECT COUNT(*) FROM articles');
    
    console.log('\n✅ Data verification:\n');
    console.log('📊 Database Statistics:');
    console.log(`   - Doctors: ${doctorsCount.rows[0].count}`);
    console.log(`   - Medicines: ${medicinesCount.rows[0].count}`);
    console.log(`   - Hospitals: ${hospitalsCount.rows[0].count}`);
    console.log(`   - Articles: ${articlesCount.rows[0].count}`);
    console.log('\n🎉 Restart the Medics app to see medicines in Pharmacy!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

loadMedicinesOnly();
