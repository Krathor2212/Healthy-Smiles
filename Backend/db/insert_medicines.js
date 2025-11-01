const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:1234@localhost:5432/healthy_smiles'
});

// Function to parse CSV
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  
  const medicines = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    if (values.length < headers.length) continue;
    
    const medicine = {};
    headers.forEach((header, index) => {
      medicine[header.trim()] = values[index] ? values[index].trim() : '';
    });
    
    // Skip duplicate header rows
    if (medicine.id === 'id') continue;
    
    medicines.push(medicine);
  }
  
  return medicines;
}

// Function to calculate price
function calculatePrice(medicine) {
  // If price exists and is valid, use it
  if (medicine.price && !isNaN(parseInt(medicine.price))) {
    return parseInt(medicine.price);
  }
  
  // Otherwise, generate a reasonable price based on category and size
  const basePrices = {
    'tablet': 50,
    'capsule': 60,
    'syrup': 80,
    'injection': 120,
    'suspension': 75,
    'cream': 70,
    'ointment': 85,
    'powder': 90,
    'solution': 65
  };
  
  // Determine type from size
  let basePrice = 60; // Default
  const size = medicine.size.toLowerCase();
  
  for (const [type, price] of Object.entries(basePrices)) {
    if (size.includes(type)) {
      basePrice = price;
      break;
    }
  }
  
  // Add variation based on strip/bottle size
  if (size.includes('strip of 10')) basePrice += 10;
  if (size.includes('strip of 15')) basePrice += 20;
  if (size.includes('bottle of 100')) basePrice += 30;
  if (size.includes('bottle of 200')) basePrice += 50;
  
  // Add some randomness (±20%)
  const variance = Math.floor(Math.random() * (basePrice * 0.4)) - (basePrice * 0.2);
  return Math.max(20, Math.floor(basePrice + variance));
}

async function insertMedicines() {
  try {
    const medicines = parseCSV('./db/medicines.csv');
    console.log(`📦 Found ${medicines.length} medicines to insert`);
    
    // Clear existing medicines
    await pool.query('DELETE FROM medicines');
    console.log('🗑️  Cleared existing medicines');
    
    let inserted = 0;
    let failed = 0;
    
    for (const med of medicines) {
      try {
        const price = calculatePrice(med);
        const originalPrice = med.original_price && !isNaN(parseInt(med.original_price)) 
          ? parseInt(med.original_price) 
          : null;
        
        await pool.query(`
          INSERT INTO medicines (
            id, name, price, original_price, currency, size, description,
            rating, reviews_count, image, category, manufacturer, 
            prescription, stock, on_sale
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          med.id,
          med.name,
          price,
          originalPrice,
          '₹',
          med.size,
          med.description,
          parseFloat(med.rating) || 0,
          parseInt(med.reviews_count) || 0,
          med.image || null,
          med.category,
          med.manufacturer,
          med.prescription === 'True' || med.prescription === 'true',
          parseInt(med.stock) || Math.floor(Math.random() * 100) + 50, // Random stock 50-150
          med.on_sale === 'True' || med.on_sale === 'true'
        ]);
        
        inserted++;
        if (inserted % 50 === 0) {
          console.log(`✓ Inserted ${inserted} medicines...`);
        }
      } catch (err) {
        failed++;
        console.error(`✗ Failed to insert medicine ${med.name}:`, err.message);
      }
    }
    
    console.log('\n============================================');
    console.log(`✅ Successfully inserted: ${inserted} medicines`);
    console.log(`❌ Failed: ${failed} medicines`);
    console.log('============================================\n');
    
    // Show sample
    const sample = await pool.query('SELECT * FROM medicines LIMIT 5');
    console.log('Sample medicines:');
    console.table(sample.rows);
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
    await pool.end();
    process.exit(1);
  }
}

insertMedicines();
