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

module.exports = { getPatientProfileForDoctor };
