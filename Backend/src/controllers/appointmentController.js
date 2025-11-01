const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { encryptText, decryptText } = require('../cryptoUtil');

/**
 * GET /api/appointments
 * Get user's appointments with optional status filter
 */
async function getAppointments(req, res) {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT id, doctor_id, doctor_name, doctor_image, specialty, 
             appointment_date, appointment_time, reason_enc, status,
             hospital_name, hospital_address, payment, created_at
      FROM appointments
      WHERE patient_id = $1
    `;

    const params = [userId];

    // Add status filter if provided
    if (status && status !== 'all') {
      let statusValue;
      switch (status.toLowerCase()) {
        case 'upcoming':
          query += ` AND status = 'Confirmed' AND appointment_date >= CURRENT_DATE`;
          break;
        case 'completed':
          query += ` AND status = 'Completed'`;
          break;
        case 'canceled':
          query += ` AND status = 'Canceled'`;
          break;
      }
    }

    query += ` ORDER BY appointment_date DESC, appointment_time DESC`;

    const result = await db.query(query, params);

    // Decrypt and format appointments
    const appointments = result.rows.map(apt => ({
      id: apt.id,
      doctorId: apt.doctor_id,
      doctorName: apt.doctor_name,
      doctorImage: apt.doctor_image,
      specialty: apt.specialty,
      date: apt.appointment_date,
      time: apt.appointment_time,
      reason: apt.reason_enc ? decryptText(apt.reason_enc) : '',
      status: apt.status,
      hospitalName: apt.hospital_name,
      hospitalAddress: apt.hospital_address,
      payment: apt.payment,
      createdAt: apt.created_at
    }));

    res.json({ appointments });
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * POST /api/appointments
 * Create a new appointment
 */
async function createAppointment(req, res) {
  try {
    const userId = req.user.id;
    const { doctorId, date, time, reason, payment } = req.body;

    if (!doctorId || !date || !time || !payment) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: doctorId, date, time, payment' 
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid date format. Expected YYYY-MM-DD' 
      });
    }

    // Validate that date is a valid date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid date value' 
      });
    }

    // Get doctor details
    const doctorResult = await db.query(
      'SELECT name, image, specialty, hospital, hospital_id, doctor_id FROM doctors_data WHERE id = $1',
      [doctorId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor not found' 
      });
    }

    const doctor = doctorResult.rows[0];
    
    // Use the linked UUID doctor_id if available, otherwise use the text ID
    const actualDoctorId = doctor.doctor_id || doctorId;

    // Get hospital details
    let hospitalName = doctor.hospital;
    let hospitalAddress = '';

    if (doctor.hospital_id) {
      const hospitalResult = await db.query(
        'SELECT name, address FROM hospitals WHERE id = $1',
        [doctor.hospital_id]
      );

      if (hospitalResult.rows.length > 0) {
        hospitalName = hospitalResult.rows[0].name;
        hospitalAddress = hospitalResult.rows[0].address;
      }
    }

    // Generate appointment ID
    const appointmentId = uuidv4();
    const reasonEnc = reason ? encryptText(reason) : null;

    // Generate transaction ID
    const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Add transaction details to payment
    const paymentData = {
      ...payment,
      isPaid: true,
      transactionId
    };

    // Insert appointment
    await db.query(`
      INSERT INTO appointments (
        id, patient_id, doctor_id, doctor_name, doctor_image, specialty,
        appointment_date, appointment_time, reason_enc, status,
        hospital_name, hospital_address, payment, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    `, [
      appointmentId, userId, actualDoctorId, doctor.name, doctor.image, doctor.specialty,
      date, time, reasonEnc, 'Confirmed',
      hospitalName, hospitalAddress, JSON.stringify(paymentData)
    ]);

    // Create notification
    await db.query(`
      INSERT INTO notifications (
        patient_id, title, description, type, icon_name, icon_color, related_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userId,
      'Appointment Confirmed',
      `Your appointment with ${doctor.name} is confirmed for ${date} at ${time}.`,
      'appointment',
      'calendar',
      '#34D399',
      appointmentId
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointmentId,
        doctorId,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        date,
        time,
        reason: reason || '',
        status: 'Confirmed',
        payment: paymentData
      }
    });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * PATCH /api/appointments/:appointmentId
 * Update appointment status
 */
async function updateAppointmentStatus(req, res) {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false,
        error: 'Status is required' 
      });
    }

    // Validate status
    const validStatuses = ['Confirmed', 'Completed', 'Canceled', 'Rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Update appointment (ensure user owns this appointment)
    const result = await db.query(`
      UPDATE appointments 
      SET status = $1
      WHERE id = $2 AND patient_id = $3
      RETURNING id, status
    `, [status, appointmentId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Appointment status updated',
      appointment: {
        id: result.rows[0].id,
        status: result.rows[0].status
      }
    });
  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

module.exports = { getAppointments, createAppointment, updateAppointmentStatus };
