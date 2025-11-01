const db = require('../db');

/**
 * GET /api/app-data
 * Centralized endpoint that returns ALL application data in one call
 * Requires JWT authentication
 */
async function getAppData(req, res) {
  try {
    // Fetch doctors
    const doctorsResult = await db.query(`
      SELECT id, name, specialty, rating, reviews_count, experience, distance, 
             image, about, hospital, hospital_id, consultation_fee, availability, categories
      FROM doctors_data
      ORDER BY rating DESC
    `);

    // Fetch medicines
    const medicinesResult = await db.query(`
      SELECT id, name, price, original_price, currency, size, description, 
             rating, reviews_count, image, category, manufacturer, 
             prescription, stock, on_sale
      FROM medicines
      ORDER BY on_sale DESC, rating DESC
    `);

    // Fetch hospitals
    const hospitalsResult = await db.query(`
      SELECT id, name, speciality, rating, reviews_count, distance, 
             latitude, longitude, address, phone, email, emergency, 
             departments, facilities, image
      FROM hospitals
      ORDER BY rating DESC
    `);

    // Fetch articles
    const articlesResult = await db.query(`
      SELECT id, category, title, date, read_time, image, content, trending
      FROM articles
      ORDER BY date DESC
    `);

    // Separate trending and latest articles
    const trendingArticles = articlesResult.rows.filter(a => a.trending);
    const latestArticles = articlesResult.rows.filter(a => !a.trending).slice(0, 10);

    // Generate categories from data
    const doctorCategories = [
      { name: 'General', icon: 'medical-outline', count: doctorsResult.rows.filter(d => d.categories?.includes('General')).length },
      { name: 'Lungs Specialist', icon: 'medkit-outline', count: doctorsResult.rows.filter(d => d.specialty === 'Lungs Specialist').length },
      { name: 'Dentist', icon: 'person-circle-outline', count: doctorsResult.rows.filter(d => d.specialty === 'Dentist').length },
      { name: 'Psychiatrist', icon: 'person-outline', count: doctorsResult.rows.filter(d => d.specialty === 'Psychiatrist').length },
      { name: 'Covid-19', icon: 'pulse-outline', count: doctorsResult.rows.filter(d => d.categories?.includes('Covid-19')).length },
      { name: 'Surgeon', icon: 'cut-outline', count: doctorsResult.rows.filter(d => d.specialty === 'Surgeon').length },
      { name: 'Cardiologist', icon: 'heart-outline', count: doctorsResult.rows.filter(d => d.specialty === 'Cardiologist').length }
    ];

    // Get unique medicine categories with counts
    const medicineCategoryMap = new Map();
    medicinesResult.rows.forEach(m => {
      if (m.category) {
        medicineCategoryMap.set(m.category, (medicineCategoryMap.get(m.category) || 0) + 1);
      }
    });

    const medicineCategories = Array.from(medicineCategoryMap.entries()).map(([name, count]) => ({
      name,
      count
    }));

    // Build response
    const response = {
      doctors: doctorsResult.rows,
      medicines: medicinesResult.rows,
      hospitals: hospitalsResult.rows,
      articles: {
        trending: trendingArticles,
        latest: latestArticles
      },
      categories: {
        doctors: doctorCategories,
        medicines: medicineCategories
      }
    };

    res.json(response);
  } catch (err) {
    console.error('Get app data error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

module.exports = { getAppData };
