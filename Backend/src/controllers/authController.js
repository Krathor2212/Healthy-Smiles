const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { encryptText, decryptText, computeHmac } = require('../cryptoUtil');
const ElGamalCrypto = require('../elgamalCrypto');

const SALT_ROUNDS = 10;

async function register(req, res) {
  /* Expected body:
    { email, password, name } - Only for patients
  */
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: email, password, name' 
      });
    }

    // Only patients register through this endpoint
    const role = 'patient';
    const table = 'patients';
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // Encrypt email and name (store ciphertext) and store deterministic HMAC for lookup
    const encEmail = encryptText(email);
    const encName = encryptText(name);
    const emailHmac = computeHmac(email);

    // Generate El Gamal key pair for medical file encryption
    const { publicKey, privateKey } = await ElGamalCrypto.generateKeyPair();
    
    // Encrypt private key before storing
    const encPrivateKey = encryptText(JSON.stringify(privateKey));

    const insertQ = `INSERT INTO ${table} (email_enc, email_hmac, password_hash, name_enc, elgamal_public_key, elgamal_private_key_enc) 
               VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const params = [encEmail, emailHmac, hashed, encName, JSON.stringify(publicKey), encPrivateKey];
    const r = await db.query(insertQ, params);

    const id = r.rows[0].id;
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30d' });
    
    res.json({ 
      token, 
      id,
      user: {
        id,
        name,
        email,
        role,
        avatar: null,
        phone: null,
        dob: null,
        height: null,
        weight: null,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({ 
        success: false,
        error: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

async function login(req, res) {
  // { email, password } - Only for patients
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing credentials' 
      });
    }

    // Only patients login through this endpoint
    const role = 'patient';
    const table = 'patients';
    
    // Use deterministic HMAC for lookup (encryption is non-deterministic)
    const emailHmac = computeHmac(email);
    
    const q = `SELECT id, password_hash, name_enc, email_enc, phone_enc, avatar, dob_enc, height_enc, weight_enc 
               FROM ${table} WHERE email_hmac = $1`;
    const r = await db.query(q, [emailHmac]);
    
    if (!r.rows.length) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    
    if (!ok) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30d' });
    
    // Decrypt user data for response
    const userData = {
      id: user.id,
      name: decryptText(user.name_enc),
      email: decryptText(user.email_enc),
      role,
      avatar: user.avatar || null,
      phone: user.phone_enc ? decryptText(user.phone_enc) : null,
      dob: user.dob_enc ? decryptText(user.dob_enc) : null,
      height: user.height_enc ? decryptText(user.height_enc) : null,
      weight: user.weight_enc ? decryptText(user.weight_enc) : null
    };

    // Get user stats if patient
    if (role === 'patient') {
      const statsQ = `
        SELECT 
          (SELECT COUNT(*) FROM appointments WHERE patient_id = $1) as appointments_count,
          (SELECT COUNT(*) FROM medical_files WHERE patient_id = $1) as files_count,
          (SELECT MAX(appointment_date) FROM appointments WHERE patient_id = $1 AND status = 'Completed') as last_visit
      `;
      const statsR = await db.query(statsQ, [user.id]);
      
      if (statsR.rows.length > 0) {
        userData.stats = {
          appointmentsCount: parseInt(statsR.rows[0].appointments_count) || 0,
          filesCount: parseInt(statsR.rows[0].files_count) || 0,
          lastVisit: statsR.rows[0].last_visit
        };
      }
    }

    res.json({ token, id: user.id, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
    }

    const emailHmac = computeHmac(email);
    
    // Check if email exists in either table
    const patientCheck = await db.query('SELECT id FROM patients WHERE email_hmac = $1', [emailHmac]);
    const doctorCheck = await db.query('SELECT id FROM doctors WHERE email_hmac = $1', [emailHmac]);
    
    if (patientCheck.rows.length === 0 && doctorCheck.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        success: true,
        message: 'Verification code sent to your email',
        expiresIn: 300
      });
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store code with expiration (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    await db.query(
      'INSERT INTO password_reset_codes (email_hmac, code, expires_at) VALUES ($1, $2, $3)',
      [emailHmac, code, expiresAt]
    );

    // TODO: Send email with code (integrate with email service)
    console.log(`Password reset code for ${email}: ${code}`);

    res.json({ 
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 300,
      // Remove this in production:
      _devCode: process.env.NODE_ENV === 'development' ? code : undefined
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

async function verifyCode(req, res) {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and code are required' 
      });
    }

    const emailHmac = computeHmac(email);
    
    // Find valid code
    const result = await db.query(
      `SELECT id FROM password_reset_codes 
       WHERE email_hmac = $1 AND code = $2 AND expires_at > NOW() AND used = false
       ORDER BY created_at DESC LIMIT 1`,
      [emailHmac, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid or expired code' 
      });
    }

    const resetCodeId = result.rows[0].id;
    
    // Generate short-lived reset token (15 minutes)
    const resetToken = jwt.sign(
      { emailHmac, resetCodeId }, 
      process.env.JWT_SECRET || 'devsecret', 
      { expiresIn: '15m' }
    );

    res.json({ 
      success: true,
      resetToken
    });
  } catch (err) {
    console.error('Verify code error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Reset token and new password are required' 
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'devsecret');
    } catch (err) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid or expired reset token' 
      });
    }

    const { emailHmac, resetCodeId } = decoded;

    // Mark code as used
    await db.query(
      'UPDATE password_reset_codes SET used = true WHERE id = $1',
      [resetCodeId]
    );

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password in both tables
    await db.query('UPDATE patients SET password_hash = $1 WHERE email_hmac = $2', [hashed, emailHmac]);
    await db.query('UPDATE doctors SET password_hash = $1 WHERE email_hmac = $2', [hashed, emailHmac]);

    res.json({ 
      success: true,
      message: 'Password updated successfully' 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

async function doctorLogin(req, res) {
  // { email, password } - For doctors only
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing credentials' 
      });
    }

    const role = 'doctor';
    
    // Use deterministic HMAC for lookup
    const emailHmac = computeHmac(email);
    
    const q = `SELECT id, password_hash, name_enc, email_enc, specialty_enc 
               FROM doctors WHERE email_hmac = $1`;
    const r = await db.query(q, [emailHmac]);
    
    if (!r.rows.length) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    const doctor = r.rows[0];
    const ok = await bcrypt.compare(password, doctor.password_hash);
    
    if (!ok) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    const token = jwt.sign({ id: doctor.id, role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30d' });
    
    // Decrypt doctor data for response
    const userData = {
      id: doctor.id,
      name: decryptText(doctor.name_enc),
      email: decryptText(doctor.email_enc),
      role,
      specialization: doctor.specialty_enc ? decryptText(doctor.specialty_enc) : null
    };

    res.json({ 
      token, 
      user: userData
    });
  } catch (err) {
    console.error('Doctor login error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

module.exports = { register, login, forgotPassword, verifyCode, resetPassword, doctorLogin };
