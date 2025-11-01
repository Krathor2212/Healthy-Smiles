const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:1234@localhost:5432/healthy_smiles'
});

async function updateRatings() {
  try {
    console.log('🔄 Updating medicine ratings...\n');
    
    // Get all medicines
    const result = await pool.query('SELECT id, name FROM medicines');
    const medicines = result.rows;
    
    console.log(`📦 Found ${medicines.length} medicines to update`);
    
    let updated = 0;
    
    for (const med of medicines) {
      // Generate random rating between 3.5 and 5.0
      const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
      
      // Generate random review count between 10 and 500
      const reviewsCount = Math.floor(Math.random() * 490) + 10;
      
      await pool.query(
        'UPDATE medicines SET rating = $1, reviews_count = $2 WHERE id = $3',
        [parseFloat(rating), reviewsCount, med.id]
      );
      
      updated++;
      if (updated % 50 === 0) {
        console.log(`✓ Updated ${updated} medicines...`);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updated} medicines with ratings!\n`);
    
    // Show statistics
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating,
        AVG(reviews_count) as avg_reviews
      FROM medicines
    `);
    
    console.log('📊 Rating Statistics:');
    console.table(stats.rows);
    
    // Show sample
    const sample = await pool.query(
      'SELECT name, rating, reviews_count FROM medicines ORDER BY rating DESC LIMIT 10'
    );
    
    console.log('\n🏆 Top 10 Rated Medicines:');
    console.table(sample.rows);
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err);
    await pool.end();
    process.exit(1);
  }
}

updateRatings();
