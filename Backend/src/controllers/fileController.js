const db = require('../db');
const { encryptBuffer, decryptBuffer, encryptText } = require('../cryptoUtil');
const { v4: uuidv4 } = require('uuid');

async function uploadMedicalFile(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
    const { role, id: userId } = req.user;
    const { patientId, description } = req.body;
    if (!patientId || !req.file) return res.status(400).json({ error: 'missing_fields' });

    // Only patients (uploading own) or doctors can upload
    if (role === 'patient' && String(userId) !== String(patientId)) return res.status(403).json({ error: 'forbidden' });

    const fileId = uuidv4();
    const encrypted = encryptBuffer(req.file.buffer);
    const filenameEnc = encryptText(req.file.originalname);
    const descEnc = description ? encryptText(description) : null;

    const q = `INSERT INTO medical_files (id, patient_id, uploaded_by_role, uploaded_by_id, filename_enc, file_data, description_enc, content_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`;
    await db.query(q, [fileId, patientId, role, userId, filenameEnc, encrypted, descEnc, req.file.mimetype]);
    res.json({ fileId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
}

async function listMedicalFilesForDoctor(req, res) {
  try {
    if (!req.user || req.user.role !== 'doctor') return res.status(403).json({ error: 'forbidden' });
    const { patientId } = req.params;
    const q = `SELECT id, filename_enc, uploaded_at, uploaded_by_role, uploaded_by_id, content_type FROM medical_files WHERE patient_id = $1 ORDER BY uploaded_at DESC`;
    const r = await db.query(q, [patientId]);
    const files = r.rows.map(row => ({
      id: row.id,
      filename: row.filename_enc ? decryptIfPossible(row.filename_enc) : null,
      uploaded_at: row.uploaded_at,
      uploaded_by_role: row.uploaded_by_role
    }));
    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
}

// helper to attempt decryption (returns placeholder if fails)
function decryptIfPossible(enc) {
  try {
    const { decryptText } = require('../cryptoUtil');
    return decryptText(enc);
  } catch (e) {
    return null;
  }
}

module.exports = { uploadMedicalFile, listMedicalFilesForDoctor };
