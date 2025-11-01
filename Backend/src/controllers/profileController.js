const db = require('../db');
const { encryptText, decryptText } = require('../cryptoUtil');

/**
 * GET /api/user/profile
 * Get current user's profile with stats
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== 'patient') {
      return res.status(403).json({ 
        success: false,
        error: 'Only patients can access this endpoint' 
      });
    }

    // Get user profile
    const userResult = await db.query(`
      SELECT id, name_enc, email_enc, phone_enc, avatar, dob_enc, height_enc, weight_enc
      FROM patients
      WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const user = userResult.rows[0];

    // Get stats
    const statsResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM appointments WHERE patient_id = $1) as appointments_count,
        (SELECT COUNT(*) FROM medical_files WHERE patient_id = $1) as files_count,
        (SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status = 'Completed') as completed_appointments,
        (SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND status = 'Confirmed' AND appointment_date >= CURRENT_DATE) as upcoming_appointments
    `, [userId]);

    const stats = statsResult.rows[0];

    // Build response
    const profile = {
      id: user.id,
      name: decryptText(user.name_enc),
      email: decryptText(user.email_enc),
      phone: user.phone_enc ? decryptText(user.phone_enc) : null,
      avatar: user.avatar || null,
      dob: user.dob_enc ? decryptText(user.dob_enc) : null,
      height: user.height_enc ? decryptText(user.height_enc) : null,
      weight: user.weight_enc ? decryptText(user.weight_enc) : null,
      stats: {
        appointmentsCount: parseInt(stats.appointments_count) || 0,
        filesCount: parseInt(stats.files_count) || 0,
        completedAppointments: parseInt(stats.completed_appointments) || 0,
        upcomingAppointments: parseInt(stats.upcoming_appointments) || 0
      }
    };

    res.json(profile);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * PUT /api/user/profile
 * Update user profile
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== 'patient') {
      return res.status(403).json({ 
        success: false,
        error: 'Only patients can access this endpoint' 
      });
    }

    const { name, phone, dob, height, weight, avatar } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name_enc = $${paramCount}`);
      values.push(encryptText(name));
      paramCount++;
    }

    if (phone) {
      updates.push(`phone_enc = $${paramCount}`);
      values.push(encryptText(phone));
      paramCount++;
    }

    if (dob) {
      updates.push(`dob_enc = $${paramCount}`);
      values.push(encryptText(dob));
      paramCount++;
    }

    if (height) {
      updates.push(`height_enc = $${paramCount}`);
      values.push(encryptText(height));
      paramCount++;
    }

    if (weight) {
      updates.push(`weight_enc = $${paramCount}`);
      values.push(encryptText(weight));
      paramCount++;
    }

    if (avatar) {
      // In production, upload avatar to cloud storage and store URL
      updates.push(`avatar = $${paramCount}`);
      values.push(avatar);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No fields to update' 
      });
    }

    // Add user ID as last parameter
    values.push(userId);

    const query = `
      UPDATE patients 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING id, name_enc, email_enc, phone_enc, avatar, dob_enc, height_enc, weight_enc
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name_enc ? decryptText(user.name_enc) : null,
        email: user.email_enc ? decryptText(user.email_enc) : null,
        phone: user.phone_enc ? decryptText(user.phone_enc) : null,
        avatar: user.avatar || null,
        dob: user.dob_enc ? decryptText(user.dob_enc) : null,
        height: user.height_enc ? decryptText(user.height_enc) : null,
        weight: user.weight_enc ? decryptText(user.weight_enc) : null
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

module.exports = { getProfile, updateProfile };
