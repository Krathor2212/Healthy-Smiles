const db = require('../db');
const { encryptText, decryptText } = require('../cryptoUtil');
const ElGamalCrypto = require('../elgamalCrypto');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/files/medical
 * Get user's medical files
 */
async function getMedicalFiles(req, res) {
  try {
    const userId = req.user.id;

    const result = await db.query(`
      SELECT id, filename_enc, mime_type, file_size, uploaded_at, uploaded_by_role
      FROM medical_files
      WHERE patient_id = $1
      ORDER BY uploaded_at DESC
    `, [userId]);

    const files = result.rows.map(file => ({
      id: file.id,
      name: file.filename_enc ? decryptText(file.filename_enc) : 'Unknown',
      uri: `/api/files/medical/${file.id}/download`,
      size: file.file_size || 0,
      mimeType: file.mime_type || 'application/octet-stream',
      createdAt: file.uploaded_at,
      uploadedBy: file.uploaded_by_role
    }));

    res.json({ files });
  } catch (err) {
    console.error('Get medical files error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * POST /api/files/medical/upload
 * Upload medical file with El Gamal encryption
 */
async function uploadMedicalFile(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file provided' 
      });
    }

    const { patientId, description } = req.body;
    const targetPatientId = patientId || userId;

    // Get patient's El Gamal public key
    const patientResult = await db.query(
      'SELECT elgamal_public_key FROM patients WHERE id = $1',
      [targetPatientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Patient not found' 
      });
    }

    const publicKey = patientResult.rows[0].elgamal_public_key;

    if (!publicKey) {
      return res.status(400).json({ 
        success: false,
        error: 'Patient does not have encryption keys' 
      });
    }

    // Encrypt file with El Gamal
    const fileBuffer = req.file.buffer;
    const fileSize = fileBuffer.length;

    // For large files, use chunked encryption
    let encrypted;
    if (fileSize > 200) {
      // Large file - encrypt in chunks
      const encryptedChunks = ElGamalCrypto.encryptLargeFile(fileBuffer, publicKey);
      encrypted = {
        c1: JSON.stringify(encryptedChunks.map(c => c.c1)),
        c2: JSON.stringify(encryptedChunks.map(c => c.c2)),
        chunked: true
      };
    } else {
      // Small file - encrypt whole
      encrypted = ElGamalCrypto.encryptFile(fileBuffer, publicKey);
      encrypted.chunked = false;
    }

    // Generate file ID
    const fileId = uuidv4();

    // Encrypt filename and description
    const filenameEnc = encryptText(req.file.originalname);
    const descEnc = description ? encryptText(description) : null;

    // Store encrypted file in database
    await db.query(`
      INSERT INTO medical_files (
        id, patient_id, uploaded_by_role, uploaded_by_id, 
        filename_enc, description_enc, mime_type, file_size,
        encrypted_c1, encrypted_c2, uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    `, [
      fileId, targetPatientId, role, userId,
      filenameEnc, descEnc, req.file.mimetype, fileSize,
      encrypted.c1, encrypted.c2
    ]);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      fileId,
      file: {
        id: fileId,
        name: req.file.originalname,
        uri: `/api/files/medical/${fileId}/download`,
        size: fileSize,
        mimeType: req.file.mimetype,
        createdAt: new Date().toISOString(),
        encryption: 'ElGamal'
      }
    });
  } catch (err) {
    console.error('Upload medical file error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: err.message
    });
  }
}

/**
 * GET /api/files/medical/:fileId/download
 * Download and decrypt medical file using El Gamal
 */
async function downloadMedicalFile(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { fileId } = req.params;

    // Get file metadata
    const fileResult = await db.query(`
      SELECT mf.patient_id, mf.filename_enc, mf.mime_type, mf.encrypted_c1, mf.encrypted_c2,
             p.elgamal_private_key_enc
      FROM medical_files mf
      JOIN patients p ON mf.patient_id = p.id
      WHERE mf.id = $1
    `, [fileId]);

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'File not found' 
      });
    }

    const file = fileResult.rows[0];

    // Verify user has permission to download
    // Allow if: user is the patient OR user is a doctor
    if (file.patient_id !== userId && userRole !== 'doctor') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    // If user is a doctor (not the patient), they can't decrypt the file
    // So we need to get the patient's private key or handle it differently
    let privateKey;
    
    if (file.patient_id === userId) {
      // User is the patient - decrypt using their key
      privateKey = JSON.parse(decryptText(file.elgamal_private_key_enc));
    } else if (userRole === 'doctor') {
      // User is a doctor - check if they have authorization
      const authResult = await db.query(`
        SELECT da.shared_key_enc, d.elgamal_private_key_enc
        FROM doctor_authorizations da
        JOIN doctors d ON da.doctor_id = d.id
        WHERE da.patient_id = $1 
          AND da.doctor_id = $2 
          AND da.is_active = true
          AND (da.expires_at IS NULL OR da.expires_at > NOW())
      `, [file.patient_id, userId]);

      if (authResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this patient\'s files. Patient must grant access first.'
        });
      }

      // Doctor has authorization - decrypt the shared key using doctor's private key
      const doctorPrivateKey = JSON.parse(decryptText(authResult.rows[0].elgamal_private_key_enc));
      
      // Parse the encrypted shared key package
      let sharedKeyPackage;
      try {
        sharedKeyPackage = JSON.parse(authResult.rows[0].shared_key_enc);
      } catch (parseErr) {
        console.error('Failed to parse shared_key_enc as JSON');
        return res.status(500).json({
          success: false,
          error: 'Authorization data is corrupted. Please ask the patient to re-grant access.'
        });
      }
      
      // HYBRID DECRYPTION:
      // Check if this is the new hybrid format (with encryptedAesKey) or old format
      if (sharedKeyPackage.encryptedAesKey) {
        // New hybrid format
        // 1. Decrypt the AES key using doctor's ElGamal private key
        const aesKeyBuffer = ElGamalCrypto.decryptFile(
          sharedKeyPackage.encryptedAesKey,
          doctorPrivateKey
        );
        
        // 2. Decrypt the patient's private key using the AES key
        const crypto = require('crypto');
        const iv = Buffer.from(sharedKeyPackage.iv, 'base64');
        const authTag = Buffer.from(sharedKeyPackage.authTag, 'base64');
        const encryptedPrivateKey = Buffer.from(sharedKeyPackage.encryptedPrivateKey, 'base64');
        
        const decipher = crypto.createDecipheriv('aes-256-gcm', aesKeyBuffer, iv);
        decipher.setAuthTag(authTag);
        const patientPrivateKeyStr = Buffer.concat([
          decipher.update(encryptedPrivateKey),
          decipher.final()
        ]).toString('utf8');
        
        privateKey = JSON.parse(patientPrivateKeyStr);
      } else {
        // Old format (direct ElGamal encryption) - for backward compatibility
        const sharedKeyBuffer = ElGamalCrypto.decryptFile(sharedKeyPackage, doctorPrivateKey);
        privateKey = JSON.parse(sharedKeyBuffer.toString());
      }
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Decrypt file
    let decryptedBuffer;
    
    try {
      // Check if file was chunked
      const c1Data = JSON.parse(file.encrypted_c1);
      const c2Data = JSON.parse(file.encrypted_c2);

      if (Array.isArray(c1Data) && Array.isArray(c2Data)) {
        // Chunked file
        const encryptedChunks = c1Data.map((c1, i) => ({
          c1,
          c2: c2Data[i]
        }));
        decryptedBuffer = ElGamalCrypto.decryptLargeFile(encryptedChunks, privateKey);
      } else {
        // Single chunk file
        decryptedBuffer = ElGamalCrypto.decryptFile({
          c1: file.encrypted_c1,
          c2: file.encrypted_c2
        }, privateKey);
      }
    } catch (decryptErr) {
      // Fallback: try as single chunk if array parsing fails
      decryptedBuffer = ElGamalCrypto.decryptFile({
        c1: file.encrypted_c1,
        c2: file.encrypted_c2
      }, privateKey);
    }

    // Set headers for download
    const filename = file.filename_enc ? decryptText(file.filename_enc) : 'download';
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', decryptedBuffer.length);

    // Send decrypted file
    res.send(decryptedBuffer);
  } catch (err) {
    console.error('Download medical file error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: err.message
    });
  }
}

/**
 * DELETE /api/files/medical/:fileId
 * Delete medical file
 */
async function deleteMedicalFile(req, res) {
  try {
    const userId = req.user.id;
    const { fileId } = req.params;

    // Delete file (ensure user owns it)
    const result = await db.query(`
      DELETE FROM medical_files
      WHERE id = $1 AND patient_id = $2
      RETURNING id
    `, [fileId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'File not found' 
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (err) {
    console.error('Delete medical file error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * GET /api/files/medical/patient/:patientId
 * List medical files for a patient (for doctors)
 */
async function listMedicalFilesForDoctor(req, res) {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    const { patientId } = req.params;

    const result = await db.query(`
      SELECT id, filename_enc, uploaded_at, uploaded_by_role, mime_type
      FROM medical_files
      WHERE patient_id = $1
      ORDER BY uploaded_at DESC
    `, [patientId]);

    const files = result.rows.map(row => ({
      id: row.id,
      filename: row.filename_enc ? decryptText(row.filename_enc) : 'Unknown',
      uploadedAt: row.uploaded_at,
      uploadedByRole: row.uploaded_by_role,
      mimeType: row.mime_type
    }));

    res.json({ files });
  } catch (err) {
    console.error('List medical files error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

module.exports = { 
  getMedicalFiles, 
  uploadMedicalFile, 
  downloadMedicalFile, 
  deleteMedicalFile,
  listMedicalFilesForDoctor 
};
