const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { encryptText, decryptText } = require('../cryptoUtil');

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if admin exists
    const result = await db.query(
      'SELECT id, name, email, password_hash FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with admin role
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create Doctor with Hospital Assignment
const createDoctor = async (req, res) => {
  try {
    const { email, password, name, specialty, hospitalIds } = req.body;
    const adminId = req.user.id;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // Encrypt email and name
    const emailEnc = encryptText(email);
    const nameEnc = encryptText(name);
    const specialtyEnc = specialty ? encryptText(specialty) : null;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create HMAC for email (for unique constraint)
    const crypto = require('crypto');
    const emailHmac = crypto
      .createHmac('sha256', process.env.ENCRYPTION_KEY)
      .update(email.toLowerCase())
      .digest('hex');

    // Check if email already exists
    const existingDoctor = await db.query(
      'SELECT id FROM doctors WHERE email_hmac = $1',
      [emailHmac]
    );

    if (existingDoctor.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Insert doctor
    const doctorResult = await db.query(
      `INSERT INTO doctors (email_enc, email_hmac, password_hash, name_enc, specialty_enc, role, created_by)
       VALUES ($1, $2, $3, $4, $5, 'doctor', $6)
       RETURNING id`,
      [emailEnc, emailHmac, passwordHash, nameEnc, specialtyEnc, adminId]
    );

    const doctorId = doctorResult.rows[0].id;

    // Assign hospitals if provided
    if (hospitalIds && Array.isArray(hospitalIds) && hospitalIds.length > 0) {
      for (const hospitalId of hospitalIds) {
        await db.query(
          `INSERT INTO hospital_assignments (doctor_id, hospital_id, assigned_by)
           VALUES ($1, $2, $3)
           ON CONFLICT (doctor_id, hospital_id) DO NOTHING`,
          [doctorId, hospitalId, adminId]
        );
      }
    }

    res.status(201).json({
      message: 'Doctor created successfully',
      doctorId,
      assignedHospitals: hospitalIds || []
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Doctors with Hospital Assignments
const getAllDoctors = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        d.id,
        d.email_enc,
        d.name_enc,
        d.specialty_enc,
        d.phone_enc,
        d.qualifications_enc,
        d.experience_enc,
        d.hospital_enc,
        d.address_enc,
        d.bio_enc,
        d.profile_photo,
        d.role,
        d.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'hospitalId', h.id,
              'hospitalName', h.name,
              'assignedAt', ha.assigned_at
            )
          ) FILTER (WHERE h.id IS NOT NULL),
          '[]'
        ) as assigned_hospitals
      FROM doctors d
      LEFT JOIN hospital_assignments ha ON d.id = ha.doctor_id
      LEFT JOIN hospitals h ON ha.hospital_id = h.id
      WHERE d.role = 'doctor'
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);

    // Decrypt doctor data
    const doctors = result.rows.map(doctor => ({
      id: doctor.id,
      email: doctor.email_enc ? decryptText(doctor.email_enc) : null,
      name: doctor.name_enc ? decryptText(doctor.name_enc) : null,
      specialty: doctor.specialty_enc ? decryptText(doctor.specialty_enc) : null,
      phone: doctor.phone_enc ? decryptText(doctor.phone_enc) : null,
      qualifications: doctor.qualifications_enc ? decryptText(doctor.qualifications_enc) : null,
      experience: doctor.experience_enc ? decryptText(doctor.experience_enc) : null,
      hospital: doctor.hospital_enc ? decryptText(doctor.hospital_enc) : null,
      address: doctor.address_enc ? decryptText(doctor.address_enc) : null,
      bio: doctor.bio_enc ? decryptText(doctor.bio_enc) : null,
      profilePhoto: doctor.profile_photo || null,
      role: doctor.role,
      createdAt: doctor.created_at,
      assignedHospitals: doctor.assigned_hospitals
    }));

    res.json({ doctors });
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Doctor Hospital Assignments
const updateDoctorHospitals = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { hospitalIds } = req.body;
    const adminId = req.user.id;

    if (!Array.isArray(hospitalIds)) {
      return res.status(400).json({ message: 'hospitalIds must be an array' });
    }

    // Remove existing assignments
    await db.query('DELETE FROM hospital_assignments WHERE doctor_id = $1', [doctorId]);

    // Add new assignments
    for (const hospitalId of hospitalIds) {
      await db.query(
        `INSERT INTO hospital_assignments (doctor_id, hospital_id, assigned_by)
         VALUES ($1, $2, $3)`,
        [doctorId, hospitalId, adminId]
      );
    }

    res.json({
      message: 'Hospital assignments updated successfully',
      doctorId,
      assignedHospitals: hospitalIds
    });
  } catch (error) {
    console.error('Update doctor hospitals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Doctor
const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Check if doctor exists
    const doctor = await db.query('SELECT id, role FROM doctors WHERE id = $1', [doctorId]);
    
    if (doctor.rows.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (doctor.rows[0].role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    // Delete doctor (cascade will handle hospital_assignments)
    await db.query('DELETE FROM doctors WHERE id = $1', [doctorId]);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Patients (View Only)
const getAllPatients = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        email_enc,
        name_enc,
        phone_enc,
        dob_enc,
        height_enc,
        weight_enc,
        profile_completed,
        created_at
      FROM patients
      ORDER BY created_at DESC
    `);

    // Decrypt patient data
    const patients = result.rows.map(patient => ({
      id: patient.id,
      email: patient.email_enc ? decryptText(patient.email_enc) : null,
      name: patient.name_enc ? decryptText(patient.name_enc) : null,
      phone: patient.phone_enc ? decryptText(patient.phone_enc) : null,
      dob: patient.dob_enc ? decryptText(patient.dob_enc) : null,
      height: patient.height_enc ? decryptText(patient.height_enc) : null,
      weight: patient.weight_enc ? decryptText(patient.weight_enc) : null,
      profileCompleted: patient.profile_completed,
      createdAt: patient.created_at
    }));

    res.json({ patients });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Medicines (View Only)
const getAllMedicines = async (req, res) => {
  try {
    console.log('📊 Admin requesting all medicines...');
    const result = await db.query(`
      SELECT 
        id,
        name,
        description,
        price,
        original_price,
        currency,
        size,
        manufacturer,
        category,
        prescription as requires_prescription,
        rating,
        reviews_count,
        stock,
        on_sale,
        image
      FROM medicines
      ORDER BY name ASC
    `);

    console.log(`✅ Found ${result.rows.length} medicines`);
    res.json({ medicines: result.rows });
  } catch (error) {
    console.error('❌ Get all medicines error:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get All Hospitals
const getAllHospitals = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id,
        name,
        speciality,
        rating,
        reviews_count,
        distance,
        address,
        phone,
        email,
        emergency,
        departments,
        facilities,
        image
      FROM hospitals
      ORDER BY name ASC
    `);

    res.json({ hospitals: result.rows });
  } catch (error) {
    console.error('Get all hospitals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const [doctorsCount, patientsCount, medicinesCount, hospitalsCount] = await Promise.all([
      db.query("SELECT COUNT(*) FROM doctors WHERE role = 'doctor'"),
      db.query('SELECT COUNT(*) FROM patients'),
      db.query('SELECT COUNT(*) FROM medicines'),
      db.query('SELECT COUNT(*) FROM hospitals')
    ]);

    res.json({
      stats: {
        totalDoctors: parseInt(doctorsCount.rows[0].count),
        totalPatients: parseInt(patientsCount.rows[0].count),
        totalMedicines: parseInt(medicinesCount.rows[0].count),
        totalHospitals: parseInt(hospitalsCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  adminLogin,
  createDoctor,
  getAllDoctors,
  updateDoctorHospitals,
  deleteDoctor,
  getAllPatients,
  getAllMedicines,
  getAllHospitals,
  getDashboardStats
};
