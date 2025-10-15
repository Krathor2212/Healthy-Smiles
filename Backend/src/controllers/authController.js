const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { encryptText, decryptText, computeHmac } = require('../cryptoUtil');

const SALT_ROUNDS = 10;

async function register(req, res) {
  /* Expected body:
    { role: 'doctor'|'patient', email, password, name, extra: { ... } }
  */
  try {
    const { role, email, password, name } = req.body;
    if (!role || !email || !password || !name) return res.status(400).json({ error: 'missing fields' });

    const table = role === 'doctor' ? 'doctors' : 'patients';
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  // encrypt email and name (store ciphertext) and store deterministic HMAC for lookup
  const encEmail = encryptText(email);
  const encName = encryptText(name);
  const emailHmac = computeHmac(email);

  const insertQ = `INSERT INTO ${table} (email_enc, email_hmac, password_hash, name_enc) VALUES ($1,$2,$3,$4) RETURNING id`;
  const r = await db.query(insertQ, [encEmail, emailHmac, hashed, encName]);
    const id = r.rows[0].id;
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET || 'devsecret');
    res.json({ token, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
}

async function login(req, res) {
  // { role, email, password }
  try {
    const { role, email, password } = req.body;
    if (!role || !email || !password) return res.status(400).json({ error: 'missing fields' });
    const table = role === 'doctor' ? 'doctors' : 'patients';
  // Use deterministic HMAC for lookup (encryption is non-deterministic)
  const emailHmac = computeHmac(email);
  const q = `SELECT id, password_hash FROM ${table} WHERE email_hmac = $1`;
  const r = await db.query(q, [emailHmac]);
    if (!r.rows.length) return res.status(401).json({ error: 'invalid_credentials' });
    const { id, password_hash } = r.rows[0];
    const ok = await bcrypt.compare(password, password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET || 'devsecret');
    res.json({ token, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
}

module.exports = { register, login };
