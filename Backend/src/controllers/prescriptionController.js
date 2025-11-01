const db = require('../db');
const { encryptText, decryptText } = require('../cryptoUtil');

const createPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'forbidden' });
    }

    const { patientId, items, diagnosis, notes } = req.body;

    if (!patientId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Patient and at least one medicine required' });
    }

    // Encrypt diagnosis and notes
    const diagnosisEnc = diagnosis ? encryptText(diagnosis) : null;
    const notesEnc = notes ? encryptText(notes) : null;

    // Insert prescription
    const prescriptionQuery = `
      INSERT INTO prescriptions (doctor_id, patient_id, diagnosis_enc, notes_enc)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `;
    
    const prescriptionResult = await db.query(prescriptionQuery, [
      doctorId,
      patientId,
      diagnosisEnc,
      notesEnc
    ]);

    const prescriptionId = prescriptionResult.rows[0].id;

    // Insert prescription items
    for (const item of items) {
      const dosageEnc = encryptText(item.dosage);
      const frequencyEnc = encryptText(item.frequency);
      const durationEnc = encryptText(item.duration);
      const instructionsEnc = item.instructions ? encryptText(item.instructions) : null;

      await db.query(
        `INSERT INTO prescription_items 
         (prescription_id, medicine_id, dosage_enc, frequency_enc, duration_enc, instructions_enc)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [prescriptionId, item.medicineId, dosageEnc, frequencyEnc, durationEnc, instructionsEnc]
      );
    }

    // Get doctor's name for notification
    const doctorQuery = await db.query('SELECT name_enc FROM doctors WHERE id = $1', [doctorId]);
    const doctorName = doctorQuery.rows[0] ? decryptText(doctorQuery.rows[0].name_enc) : 'Doctor';

    // Create notification for patient
    const notificationTitle = 'New Prescription';
    const notificationDescription = `Dr. ${doctorName} has prescribed ${items.length} medicine(s) for you`;
    
    await db.query(
      `INSERT INTO notifications (patient_id, title, description, type, related_id, icon_name, icon_color)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        patientId,
        notificationTitle,
        notificationDescription,
        'prescription',
        prescriptionId,
        'file-text',
        '#0091F5'
      ]
    );

    res.status(201).json({
      message: 'Prescription created successfully',
      prescriptionId,
      createdAt: prescriptionResult.rows[0].created_at
    });

  } catch (err) {
    console.error('Create prescription error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
};

const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id;
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'forbidden' });
    }

    const query = `
      SELECT 
        pr.id,
        pr.created_at,
        pr.diagnosis_enc,
        pr.notes_enc,
        p.id as patient_id,
        p.name_enc,
        p.email_enc
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      WHERE pr.doctor_id = $1
      ORDER BY pr.created_at DESC
      LIMIT 50
    `;

    const result = await db.query(query, [doctorId]);

    const prescriptions = result.rows.map(row => ({
      id: row.id,
      createdAt: row.created_at,
      diagnosis: row.diagnosis_enc ? decryptText(row.diagnosis_enc) : null,
      notes: row.notes_enc ? decryptText(row.notes_enc) : null,
      patient: {
        id: row.patient_id,
        name: decryptText(row.name_enc),
        email: decryptText(row.email_enc)
      }
    }));

    res.json({ prescriptions });

  } catch (err) {
    console.error('Get prescriptions error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
};

const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id;
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'forbidden' });
    }

    const query = `
      SELECT 
        pr.id,
        pr.created_at,
        pr.diagnosis_enc,
        pr.notes_enc,
        d.id as doctor_id,
        d.name_enc as doctor_name_enc,
        d.specialty_enc
      FROM prescriptions pr
      JOIN doctors d ON pr.doctor_id = d.id
      WHERE pr.patient_id = $1
      ORDER BY pr.created_at DESC
    `;

    const result = await db.query(query, [patientId]);

    const prescriptions = await Promise.all(result.rows.map(async row => {
      // Get prescription items
      const itemsQuery = `
        SELECT 
          pi.medicine_id,
          pi.dosage_enc,
          pi.frequency_enc,
          pi.duration_enc,
          pi.instructions_enc,
          m.name,
          m.price,
          m.image
        FROM prescription_items pi
        LEFT JOIN medicines m ON pi.medicine_id = m.id
        WHERE pi.prescription_id = $1
      `;
      
      const itemsResult = await db.query(itemsQuery, [row.id]);
      
      const items = itemsResult.rows.map(item => ({
        medicineId: item.medicine_id,
        medicineName: item.name,
        price: item.price,
        image: item.image,
        dosage: decryptText(item.dosage_enc),
        frequency: decryptText(item.frequency_enc),
        duration: decryptText(item.duration_enc),
        instructions: item.instructions_enc ? decryptText(item.instructions_enc) : null
      }));

      return {
        id: row.id,
        createdAt: row.created_at,
        diagnosis: row.diagnosis_enc ? decryptText(row.diagnosis_enc) : null,
        notes: row.notes_enc ? decryptText(row.notes_enc) : null,
        doctor: {
          id: row.doctor_id,
          name: decryptText(row.doctor_name_enc),
          specialty: row.specialty_enc ? decryptText(row.specialty_enc) : null
        },
        items
      };
    }));

    res.json({ prescriptions });

  } catch (err) {
    console.error('Get patient prescriptions error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
};

module.exports = {
  createPrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions
};
