const db = require('../db');
const { decryptText } = require('../cryptoUtil');

/**
 * Create an access request from doctor to patient
 */
const createAccessRequest = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId, message } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    // Check if patient exists
    const patientResult = await db.query(
      'SELECT id FROM patients WHERE id = $1',
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check if already has active authorization
    const authCheck = await db.query(
      `SELECT id FROM doctor_authorizations 
       WHERE patient_id = $1 AND doctor_id = $2 AND is_active = true
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [patientId, doctorId]
    );

    if (authCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Already have active authorization' });
    }

    // Check if pending request already exists
    const existingRequest = await db.query(
      `SELECT id FROM access_requests 
       WHERE patient_id = $1 AND doctor_id = $2 AND status = 'pending'`,
      [patientId, doctorId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'Request already pending' });
    }

    // Create access request
    const result = await db.query(
      `INSERT INTO access_requests (patient_id, doctor_id, message, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [patientId, doctorId, message || 'Requesting access to view your medical files']
    );

    // Get doctor info for notification
    const doctorResult = await db.query(
      'SELECT name_enc, specialty_enc FROM doctors WHERE id = $1',
      [doctorId]
    );

    const doctorName = doctorResult.rows[0]?.name_enc 
      ? decryptText(doctorResult.rows[0].name_enc) 
      : 'A doctor';
    const specialty = doctorResult.rows[0]?.specialty_enc 
      ? decryptText(doctorResult.rows[0].specialty_enc)
      : '';

    // Create notification for patient
    await db.query(
      `INSERT INTO notifications (user_id, user_type, type, title, description, related_id, related_type)
       VALUES ($1, 'patient', 'access_request', $2, $3, $4, 'access_request')`,
      [
        patientId,
        'Access Request',
        `Dr. ${doctorName}${specialty ? ' (' + specialty + ')' : ''} has requested access to view your medical files`,
        result.rows[0].id
      ]
    );

    res.json({
      message: 'Access request sent successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Create access request error:', error);
    res.status(500).json({ error: 'Failed to create access request' });
  }
};

/**
 * Get access requests (for patients to see pending requests, for doctors to see their requests)
 */
const getAccessRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;

    let result;

    if (userRole === 'patient') {
      // Get requests to this patient
      const query = `
        SELECT 
          ar.id,
          ar.doctor_id,
          d.name_enc as doctor_name,
          d.specialty_enc as specialty,
          ar.requested_at,
          ar.status,
          ar.message,
          ar.responded_at
        FROM access_requests ar
        JOIN doctors d ON ar.doctor_id = d.id
        WHERE ar.patient_id = $1
        ${status ? 'AND ar.status = $2' : ''}
        ORDER BY ar.requested_at DESC
      `;
      
      result = await db.query(
        query,
        status ? [userId, status] : [userId]
      );

      // Decrypt doctor names
      result.rows = result.rows.map(row => ({
        ...row,
        doctor_name: row.doctor_name ? decryptText(row.doctor_name) : 'Unknown'
      }));
    } else if (userRole === 'doctor') {
      // Get requests from this doctor
      const query = `
        SELECT 
          ar.id,
          ar.patient_id,
          p.name_enc as patient_name,
          ar.requested_at,
          ar.status,
          ar.message,
          ar.responded_at
        FROM access_requests ar
        JOIN patients p ON ar.patient_id = p.id
        WHERE ar.doctor_id = $1
        ${status ? 'AND ar.status = $2' : ''}
        ORDER BY ar.requested_at DESC
      `;
      
      result = await db.query(
        query,
        status ? [userId, status] : [userId]
      );

      // Decrypt patient names
      result.rows = result.rows.map(row => ({
        ...row,
        patient_name: row.patient_name ? decryptText(row.patient_name) : 'Unknown'
      }));
    } else {
      return res.status(403).json({ error: 'Invalid user role' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Get access requests error:', error);
    res.status(500).json({ error: 'Failed to get access requests' });
  }
};

/**
 * Respond to access request (approve/deny)
 */
const respondToAccessRequest = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { requestId } = req.params;
    const { action, expiresInDays } = req.body; // action: 'approve' or 'deny'

    if (!action || !['approve', 'deny'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Get request details
    const requestResult = await db.query(
      'SELECT * FROM access_requests WHERE id = $1 AND patient_id = $2',
      [requestId, patientId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Update request status
    await db.query(
      `UPDATE access_requests 
       SET status = $1, responded_at = NOW()
       WHERE id = $2`,
      [action === 'approve' ? 'approved' : 'denied', requestId]
    );

    if (action === 'approve') {
      // Grant authorization using the existing authorization controller logic
      // We'll import and call it here
      const authController = require('./authorizationController');
      
      // Create a mock request/response to call grantDoctorAccess
      const mockReq = {
        user: { userId: patientId, role: 'patient' },
        body: { doctorId: request.doctor_id, expiresInDays }
      };
      
      const mockRes = {
        json: (data) => data,
        status: function(code) {
          this.statusCode = code;
          return this;
        }
      };

      await authController.grantDoctorAccess(mockReq, mockRes);

      // Create notification for doctor
      const patientResult = await db.query(
        'SELECT name_enc FROM patients WHERE id = $1',
        [patientId]
      );

      const patientName = patientResult.rows[0]?.name_enc 
        ? decryptText(patientResult.rows[0].name_enc) 
        : 'A patient';

      await db.query(
        `INSERT INTO notifications (user_id, user_type, type, title, description, related_id, related_type)
         VALUES ($1, 'doctor', 'access_granted', $2, $3, $4, 'access_request')`,
        [
          request.doctor_id,
          'Access Granted',
          `${patientName} has granted you access to view their medical files`,
          requestId
        ]
      );
    } else {
      // Create notification for doctor about denial
      const patientResult = await db.query(
        'SELECT name_enc FROM patients WHERE id = $1',
        [patientId]
      );

      const patientName = patientResult.rows[0]?.name_enc 
        ? decryptText(patientResult.rows[0].name_enc) 
        : 'A patient';

      await db.query(
        `INSERT INTO notifications (user_id, user_type, type, title, description, related_id, related_type)
         VALUES ($1, 'doctor', 'access_denied', $2, $3, $4, 'access_request')`,
        [
          request.doctor_id,
          'Access Denied',
          `${patientName} has denied your request to view their medical files`,
          requestId
        ]
      );
    }

    res.json({
      message: action === 'approve' ? 'Access granted successfully' : 'Request denied',
      request: { ...request, status: action === 'approve' ? 'approved' : 'denied' }
    });
  } catch (error) {
    console.error('Respond to access request error:', error);
    res.status(500).json({ error: 'Failed to respond to request' });
  }
};

/**
 * Get audit log for authorizations
 */
const getAuditLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 50 } = req.query;

    let result;

    if (userRole === 'patient') {
      result = await db.query(`
        SELECT 
          al.*,
          d.name_enc as doctor_name
        FROM authorization_audit_log al
        LEFT JOIN doctors d ON al.doctor_id = d.id
        WHERE al.patient_id = $1
        ORDER BY al.created_at DESC
        LIMIT $2
      `, [userId, limit]);

      // Decrypt doctor names
      result.rows = result.rows.map(row => ({
        ...row,
        doctor_name: row.doctor_name ? decryptText(row.doctor_name) : 'Unknown'
      }));
    } else if (userRole === 'doctor') {
      result = await db.query(`
        SELECT 
          al.*,
          p.name_enc as patient_name
        FROM authorization_audit_log al
        LEFT JOIN patients p ON al.patient_id = p.id
        WHERE al.doctor_id = $1
        ORDER BY al.created_at DESC
        LIMIT $2
      `, [userId, limit]);

      // Decrypt patient names
      result.rows = result.rows.map(row => ({
        ...row,
        patient_name: row.patient_name ? decryptText(row.patient_name) : 'Unknown'
      }));
    } else {
      return res.status(403).json({ error: 'Invalid user role' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: 'Failed to get audit log' });
  }
};

module.exports = {
  createAccessRequest,
  getAccessRequests,
  respondToAccessRequest,
  getAuditLog
};
