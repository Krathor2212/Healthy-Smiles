const db = require('../db');
const { decryptText } = require('../cryptoUtil');

/**
 * GET /api/app-data
 * Centralized endpoint that returns ALL application data in one call
 * Requires JWT authentication
 */
async function getAppData(req, res) {
  try {
    console.log('📱 Mobile app requesting /api/app-data...');
    
    // Fetch REAL doctors from the doctors table (not sample data)
    const doctorsResult = await db.query(`
      SELECT 
        d.id, 
        d.name_enc, 
        d.email_enc,
        d.specialty_enc, 
        d.experience_enc,
        d.bio_enc,
        d.address_enc,
        d.phone_enc,
        d.profile_photo,
        d.role,
        d.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'hospitalId', h.id,
              'hospitalName', h.name
            )
          ) FILTER (WHERE h.id IS NOT NULL),
          '[]'
        ) as assigned_hospitals
      FROM doctors d
      LEFT JOIN hospital_assignments ha ON d.id = ha.doctor_id
      LEFT JOIN hospitals h ON ha.hospital_id = h.id
      WHERE d.role = 'doctor'
      GROUP BY d.id, d.name_enc, d.email_enc, d.specialty_enc, d.experience_enc, d.bio_enc, d.address_enc, d.phone_enc, d.profile_photo, d.role, d.created_at
      ORDER BY d.created_at DESC
    `);

    console.log(`🔍 Found ${doctorsResult.rows.length} doctors in database`);

    // Decrypt doctor data and format for mobile app
    const doctors = doctorsResult.rows.map((doctor, index) => {
      try {
        const decryptedName = doctor.name_enc ? decryptText(doctor.name_enc) : 'Unknown Doctor';
        const decryptedEmail = doctor.email_enc ? decryptText(doctor.email_enc) : '';
        const decryptedSpecialty = doctor.specialty_enc ? decryptText(doctor.specialty_enc) : 'General Physician';
        const decryptedExperience = doctor.experience_enc ? decryptText(doctor.experience_enc) : '5 years';
        const decryptedBio = doctor.bio_enc ? decryptText(doctor.bio_enc) : 'Experienced medical professional';
        const decryptedAddress = doctor.address_enc ? decryptText(doctor.address_enc) : '';
        const decryptedPhone = doctor.phone_enc ? decryptText(doctor.phone_enc) : '';
        
        console.log(`   ✓ Doctor ${index + 1}: ${decryptedName}, Specialty: ${decryptedSpecialty}`);
        
        // Get primary hospital (first assigned hospital)
        const primaryHospital = doctor.assigned_hospitals && doctor.assigned_hospitals.length > 0 
          ? doctor.assigned_hospitals[0] 
          : { hospitalId: '', hospitalName: 'General Hospital' };

        return {
          id: doctor.id,
          name: decryptedName,
          specialty: decryptedSpecialty,
          rating: 4.8,
          reviewsCount: 127,
          experience: decryptedExperience,
          distance: '2.5 km',
          image: doctor.profile_photo || '',
          about: decryptedBio,
          hospital: primaryHospital.hospitalName,
          hospitalId: primaryHospital.hospitalId,
          consultationFee: 50,
          availability: {
            monday: ['9:00 AM', '5:00 PM'],
            tuesday: ['9:00 AM', '5:00 PM'],
            wednesday: ['9:00 AM', '5:00 PM'],
            thursday: ['9:00 AM', '5:00 PM'],
            friday: ['9:00 AM', '5:00 PM'],
            saturday: ['9:00 AM', '1:00 PM'],
          },
          categories: [decryptedSpecialty, 'General'],
          assignedHospitals: doctor.assigned_hospitals
        };
      } catch (err) {
        console.error(`   ✗ Failed to decrypt doctor ${doctor.id}:`, err.message);
        return null;
      }
    }).filter(d => d !== null);

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

    // Generate categories from REAL data
    const doctorCategories = [
      { name: 'All', icon: 'grid-outline', count: doctors.length },
      { name: 'General Physician', icon: 'medical-outline', count: doctors.filter(d => d.specialty.includes('General')).length },
      { name: 'Cardiologist', icon: 'heart-outline', count: doctors.filter(d => d.specialty === 'Cardiologist').length },
      { name: 'Dentist', icon: 'person-circle-outline', count: doctors.filter(d => d.specialty === 'Dentist').length },
      { name: 'Psychiatrist', icon: 'person-outline', count: doctors.filter(d => d.specialty === 'Psychiatrist').length },
      { name: 'Surgeon', icon: 'cut-outline', count: doctors.filter(d => d.specialty === 'Surgeon').length },
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
      doctors: doctors,
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

    console.log(`📊 Sending response: ${doctors.length} doctors, ${medicinesResult.rows.length} medicines, ${hospitalsResult.rows.length} hospitals`);
    console.log(`   Doctor names: ${doctors.map(d => d.name).join(', ')}`);

    res.json(response);
  } catch (err) {
    console.error('❌ Get app data error:', err);
    console.error('   Stack:', err.stack);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: err.message
    });
  }
}

/**
 * GET /api/hospitals/:hospitalId/doctors
 * Get all doctors assigned to a specific hospital
 */
async function getHospitalDoctors(req, res) {
  try {
    const { hospitalId } = req.params;
    const { decryptText } = require('../cryptoUtil');

    // Get doctors assigned to this hospital
    const result = await db.query(`
      SELECT 
        d.id,
        d.name_enc,
        d.specialty_enc,
        d.phone_enc,
        d.experience_enc,
        d.bio_enc,
        ha.assigned_at
      FROM doctors d
      INNER JOIN hospital_assignments ha ON d.id = ha.doctor_id
      WHERE ha.hospital_id = $1 AND d.role = 'doctor'
      ORDER BY d.name_enc
    `, [hospitalId]);

    // Decrypt doctor data
    const doctors = result.rows.map(doctor => ({
      id: doctor.id,
      name: doctor.name_enc ? decryptText(doctor.name_enc) : 'Unknown',
      specialty: doctor.specialty_enc ? decryptText(doctor.specialty_enc) : 'General',
      phone: doctor.phone_enc ? decryptText(doctor.phone_enc) : null,
      experience: doctor.experience_enc ? decryptText(doctor.experience_enc) : null,
      bio: doctor.bio_enc ? decryptText(doctor.bio_enc) : null,
      assignedAt: doctor.assigned_at,
      // Default values for mobile app compatibility
      rating: 4.5,
      image: 'https://via.placeholder.com/150',
      availability: 'Available'
    }));

    res.json({
      success: true,
      hospitalId,
      doctors,
      count: doctors.length
    });
  } catch (err) {
    console.error('Get hospital doctors error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

module.exports = { getAppData, getHospitalDoctors };
