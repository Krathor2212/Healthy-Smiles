const db = require('../db');
const { decryptText } = require('../cryptoUtil');

async function getPatientProfileForDoctor(req, res) {
  try {
    const { patientId } = req.params;
    // ensure the requester is a doctor
    if (!req.user || req.user.role !== 'doctor') return res.status(403).json({ error: 'forbidden' });

    const q = `SELECT id, name_enc, email_enc, dob_enc FROM patients WHERE id = $1`;
    const r = await db.query(q, [patientId]);
    if (!r.rows.length) return res.status(404).json({ error: 'not_found' });
    const row = r.rows[0];
    const profile = {
      id: row.id,
      name: decryptText(row.name_enc),
      email: decryptText(row.email_enc),
      dob: row.dob_enc ? decryptText(row.dob_enc) : null
    };
    res.json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
}

async function getDoctorStats(req, res) {
  try {
    const doctorId = req.user.id;
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'forbidden' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statsQ = `
      SELECT 
        (SELECT COUNT(*) FROM appointments WHERE doctor_id = $1 AND appointment_date::date = $2::date) as today_appointments,
        (SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = $1) as total_patients,
        (SELECT COUNT(*) FROM prescriptions WHERE doctor_id = $1) as prescriptions_issued,
        (SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE doctor_id = $1 AND status = 'Completed' AND appointment_date >= NOW() - INTERVAL '30 days') as active_patients
    `;
    
    const statsR = await db.query(statsQ, [doctorId, today]);
    const stats = {
      todayAppointments: parseInt(statsR.rows[0].today_appointments) || 0,
      totalPatients: parseInt(statsR.rows[0].total_patients) || 0,
      prescriptionsIssued: parseInt(statsR.rows[0].prescriptions_issued) || 0,
      activePatients: parseInt(statsR.rows[0].active_patients) || 0
    };

    res.json(stats);
  } catch (err) {
    console.error('Get doctor stats error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}

async function getTodayAppointments(req, res) {
  try {
    const doctorId = req.user.id;
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'forbidden' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = `
      SELECT 
        a.id, 
        a.appointment_date, 
        a.appointment_time, 
        a.status,
        a.reason_enc,
        a.specialty,
        p.id as patient_id,
        p.name_enc,
        p.email_enc
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = $1 AND a.appointment_date::date = $2::date
      ORDER BY a.appointment_time ASC
    `;
    
    const r = await db.query(q, [doctorId, today]);
    
    const appointments = r.rows.map(row => ({
      id: row.id,
      appointmentDate: row.appointment_date,
      appointmentTime: row.appointment_time,
      status: row.status,
      reason: row.reason_enc ? decryptText(row.reason_enc) : null,
      specialty: row.specialty,
      patient: {
        id: row.patient_id,
        name: decryptText(row.name_enc),
        email: decryptText(row.email_enc)
      }
    }));

    res.json({ appointments });
  } catch (err) {
    console.error('Get today appointments error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}

async function getAllAppointments(req, res) {
  try {
    const doctorId = req.user.id;
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'forbidden' });

    const { status, date } = req.query;
    
    console.log('[GET /doctor/appointments]');
    console.log('Doctor ID:', doctorId);
    console.log('Query params - date:', date, 'status:', status);
    
    let q = `
      SELECT 
        a.id, 
        a.appointment_date, 
        a.appointment_time, 
        a.status,
        a.reason_enc,
        a.specialty,
        a.hospital_name,
        a.hospital_address,
        p.id as patient_id,
        p.name_enc,
        p.email_enc,
        p.phone_enc
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = $1
    `;
    
    const params = [doctorId];
    let paramIndex = 2;

    if (status) {
      q += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (date) {
      q += ` AND a.appointment_date::date = $${paramIndex}::date`;
      params.push(date);
      paramIndex++;
    }

    q += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
    
    console.log('SQL Query:', q);
    console.log('SQL Params:', params);
    
    const r = await db.query(q, params);
    
    console.log('Found', r.rows.length, 'appointments');
    
    const appointments = r.rows.map(row => ({
      id: row.id,
      appointmentDate: row.appointment_date,
      appointmentTime: row.appointment_time,
      status: row.status,
      reason: row.reason_enc ? decryptText(row.reason_enc) : null,
      specialty: row.specialty,
      hospitalName: row.hospital_name,
      hospitalAddress: row.hospital_address,
      patient: {
        id: row.patient_id,
        name: decryptText(row.name_enc),
        email: decryptText(row.email_enc),
        phone: row.phone_enc ? decryptText(row.phone_enc) : null
      }
    }));

    res.json({ appointments });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}

async function updateAppointmentStatus(req, res) {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;
    const doctorId = req.user.id;

    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'forbidden' });

    // Verify appointment belongs to this doctor
    const checkQ = `SELECT id FROM appointments WHERE id = $1 AND doctor_id = $2`;
    const checkR = await db.query(checkQ, [appointmentId, doctorId]);
    
    if (!checkR.rows.length) {
      return res.status(404).json({ error: 'appointment_not_found' });
    }

    const updateQ = `
      UPDATE appointments 
      SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const updateR = await db.query(updateQ, [status, notes, appointmentId]);
    
    res.json({ 
      success: true,
      appointment: updateR.rows[0]
    });
  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}

async function getPatients(req, res) {
  try {
    const doctorId = req.user.id;
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'forbidden' });

    const { search } = req.query;

    let q = `
      SELECT DISTINCT
        p.id,
        p.name_enc,
        p.email_enc,
        p.phone_enc,
        p.dob_enc,
        (SELECT COUNT(*) FROM appointments WHERE patient_id = p.id AND doctor_id = $1) as appointment_count,
        (SELECT MAX(appointment_date) FROM appointments WHERE patient_id = p.id AND doctor_id = $1) as last_visit
      FROM patients p
      JOIN appointments a ON p.id = a.patient_id
      WHERE a.doctor_id = $1
    `;

    const params = [doctorId];

    q += ` ORDER BY last_visit DESC NULLS LAST`;

    const r = await db.query(q, params);

    let patients = r.rows.map(row => ({
      id: row.id,
      name: decryptText(row.name_enc),
      email: decryptText(row.email_enc),
      phone: row.phone_enc ? decryptText(row.phone_enc) : null,
      dob: row.dob_enc ? decryptText(row.dob_enc) : null,
      appointmentCount: parseInt(row.appointment_count) || 0,
      lastVisit: row.last_visit
    }));

    // Filter by search after decryption
    if (search) {
      const searchLower = search.toLowerCase();
      patients = patients.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower)
      );
    }

    res.json({ patients });
  } catch (err) {
    console.error('Get patients error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}

async function searchMedicines(req, res) {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'forbidden' });

    const { search } = req.query;

    let q = `
      SELECT id, name, price, original_price, currency, size, description, 
             category, manufacturer, prescription, stock
      FROM medicines
    `;

    const params = [];

    if (search) {
      // If search is a single letter, find medicines starting with that letter
      if (search.length === 1) {
        q += ` WHERE UPPER(LEFT(name, 1)) = UPPER($1)`;
        params.push(search);
      } else {
        // Otherwise search in name, category, or manufacturer
        q += ` WHERE (LOWER(name) LIKE LOWER($1) OR LOWER(category) LIKE LOWER($1) OR LOWER(manufacturer) LIKE LOWER($1))`;
        params.push(`%${search}%`);
      }
    }

    q += ` ORDER BY name ASC LIMIT 100`;

    const r = await db.query(q, params);

    // Transform to match frontend expectations
    const medicines = r.rows.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      price: m.price,
      category: m.category,
      manufacturer: m.manufacturer,
      inStock: true, // Always show as in stock for doctor prescriptions
      size: m.size
    }));

    res.json({ medicines });
  } catch (err) {
    console.error('Search medicines error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}

module.exports = { 
  getPatientProfileForDoctor,
  getDoctorStats,
  getTodayAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  getPatients,
  searchMedicines
};
