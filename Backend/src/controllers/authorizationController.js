const db = require('../db');
const { encryptText, decryptText } = require('../cryptoUtil');
const ElGamalCrypto = require('../elgamalCrypto');
const crypto = require('crypto');

/**
 * POST /api/authorizations/grant
 * Patient grants doctor access to their medical files
 */
async function grantDoctorAccess(req, res) {
  try {
    const patientId = req.user.id;
    const { doctorId, expiresInDays } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        error: 'Doctor ID is required'
      });
    }

    // Get patient's private key
    const patientResult = await db.query(
      'SELECT elgamal_private_key_enc FROM patients WHERE id = $1',
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Get doctor's public key
    const doctorResult = await db.query(
      'SELECT elgamal_public_key FROM doctors WHERE id = $1',
      [doctorId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    const doctorPublicKey = doctorResult.rows[0].elgamal_public_key;
    
    if (!doctorPublicKey) {
      return res.status(400).json({
        success: false,
        error: 'Doctor does not have encryption keys set up'
      });
    }

    // Decrypt patient's private key
    const patientPrivateKey = decryptText(patientResult.rows[0].elgamal_private_key_enc);
    
    // HYBRID ENCRYPTION APPROACH:
    // 1. Generate random AES key (32 bytes)
    const aesKey = crypto.randomBytes(32);
    
    // 2. Encrypt patient's private key with AES
    const iv = crypto.randomBytes(12); // GCM IV
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    const encryptedPrivateKey = Buffer.concat([
      cipher.update(patientPrivateKey, 'utf8'),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    
    // 3. Encrypt only the AES key with doctor's ElGamal public key
    const encryptedAesKey = ElGamalCrypto.encryptFile(
      aesKey,
      JSON.parse(doctorPublicKey)
    );
    
    // 4. Package everything together
    const sharedKeyPackage = {
      encryptedAesKey: encryptedAesKey, // ElGamal encrypted AES key
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      encryptedPrivateKey: encryptedPrivateKey.toString('base64')
    };

    // Calculate expiration date
    let expiresAt = null;
    if (expiresInDays) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + parseInt(expiresInDays));
      expiresAt = expireDate;
    }

    // Store authorization
    const result = await db.query(`
      INSERT INTO doctor_authorizations (patient_id, doctor_id, shared_key_enc, expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (patient_id, doctor_id) 
      DO UPDATE SET 
        shared_key_enc = $3,
        expires_at = $4,
        is_active = true,
        authorized_at = CURRENT_TIMESTAMP
      RETURNING id, authorized_at, expires_at
    `, [patientId, doctorId, JSON.stringify(sharedKeyPackage), expiresAt]);

    const authorizationId = result.rows[0].id;

    // Create audit log entry
    await db.query(`
      INSERT INTO authorization_audit_log 
      (authorization_id, patient_id, doctor_id, action, performed_by, new_expires_at, new_is_active)
      VALUES ($1, $2, $3, 'granted', 'patient', $4, true)
    `, [authorizationId, patientId, doctorId, expiresAt]);

    // Create notification for doctor
    await db.query(`
      INSERT INTO notifications (user_id, user_type, type, title, description, related_id, related_type)
      VALUES ($1, 'doctor', 'access_granted', 'Access Granted', $2, $3, 'authorization')
    `, [doctorId, 'A patient has granted you access to view their medical files', authorizationId]);

    res.json({
      success: true,
      authorization: result.rows[0],
      message: 'Doctor access granted successfully'
    });
  } catch (err) {
    console.error('Grant doctor access error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message
    });
  }
}

/**
 * DELETE /api/authorizations/revoke/:doctorId
 * Patient revokes doctor access
 */
async function revokeDoctorAccess(req, res) {
  try {
    const patientId = req.user.id;
    const { doctorId } = req.params;

    const result = await db.query(`
      UPDATE doctor_authorizations
      SET is_active = false
      WHERE patient_id = $1 AND doctor_id = $2
      RETURNING id
    `, [patientId, doctorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Authorization not found'
      });
    }

    const authorizationId = result.rows[0].id;

    // Create audit log entry
    await db.query(`
      INSERT INTO authorization_audit_log 
      (authorization_id, patient_id, doctor_id, action, performed_by, old_is_active, new_is_active)
      VALUES ($1, $2, $3, 'revoked', 'patient', true, false)
    `, [authorizationId, patientId, doctorId]);

    // Create notification for doctor
    await db.query(`
      INSERT INTO notifications (user_id, user_type, type, title, description, related_id, related_type)
      VALUES ($1, 'doctor', 'access_revoked', 'Access Revoked', $2, $3, 'authorization')
    `, [doctorId, 'A patient has revoked your access to their medical files', authorizationId]);

    res.json({
      success: true,
      message: 'Doctor access revoked successfully'
    });
  } catch (err) {
    console.error('Revoke doctor access error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * GET /api/authorizations
 * Get list of authorized doctors (for patients) or authorized patients (for doctors)
 */
async function getAuthorizations(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let result;
    if (userRole === 'patient') {
      // Get doctors authorized by this patient
      result = await db.query(`
        SELECT 
          da.id,
          da.doctor_id,
          d.name_enc as doctor_name,
          d.specialty_enc as specialty,
          da.authorized_at,
          da.expires_at,
          da.is_active
        FROM doctor_authorizations da
        JOIN doctors d ON da.doctor_id = d.id
        WHERE da.patient_id = $1
        ORDER BY da.authorized_at DESC
      `, [userId]);

      // Decrypt doctor names and specialties
      result.rows = result.rows.map(row => ({
        ...row,
        doctor_name: row.doctor_name ? decryptText(row.doctor_name) : 'Unknown',
        doctor_specialty: row.specialty ? decryptText(row.specialty) : ''
      }));
    } else if (userRole === 'doctor') {
      // Get patients who authorized this doctor
      result = await db.query(`
        SELECT 
          da.id,
          da.patient_id,
          p.name_enc as patient_name,
          p.email_enc as patient_email,
          da.authorized_at,
          da.expires_at,
          da.is_active
        FROM doctor_authorizations da
        JOIN patients p ON da.patient_id = p.id
        WHERE da.doctor_id = $1
        ORDER BY da.authorized_at DESC
      `, [userId]);

      // Decrypt patient names and emails
      result.rows = result.rows.map(row => ({
        ...row,
        patient_name: row.patient_name ? decryptText(row.patient_name) : 'Unknown',
        patient_email: row.patient_email ? decryptText(row.patient_email) : ''
      }));
    } else {
      return res.status(403).json({
        success: false,
        error: 'Invalid user role'
      });
    }

    res.json({
      success: true,
      authorizations: result.rows
    });
  } catch (err) {
    console.error('Get authorizations error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

module.exports = {
  grantDoctorAccess,
  revokeDoctorAccess,
  getAuthorizations
};
