const crypto = require('crypto');

const ENC_KEY = process.env.ENCRYPTION_KEY; // base64 encoded 32 bytes
const IV_LENGTH = parseInt(process.env.ENCRYPTION_IV_LENGTH || '12', 10); // recommended for GCM
const HMAC_KEY = process.env.HMAC_KEY || process.env.JWT_SECRET || process.env.ENCRYPTION_KEY;

if (!ENC_KEY) {
  console.warn('ENCRYPTION_KEY not set. Generate a base64 32 byte key and set ENCRYPTION_KEY in .env');
}

function getKey() {
  if (!ENC_KEY) throw new Error('ENCRYPTION_KEY not configured');
  return Buffer.from(ENC_KEY, 'base64');
}

function encryptText(plain) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decryptText(payload) {
  const data = Buffer.from(payload, 'base64');
  const iv = data.slice(0, IV_LENGTH);
  const tag = data.slice(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = data.slice(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

function decryptBuffer(payloadBuffer) {
  const iv = payloadBuffer.slice(0, IV_LENGTH);
  const tag = payloadBuffer.slice(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = payloadBuffer.slice(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

function computeHmac(value) {
  if (!HMAC_KEY) throw new Error('HMAC_KEY (or JWT_SECRET/ENCRYPTION_KEY) not configured');
  const keyBuf = Buffer.from(HMAC_KEY, 'base64');
  return crypto.createHmac('sha256', keyBuf).update(String(value)).digest('hex');
}

module.exports = { encryptText, decryptText, encryptBuffer, decryptBuffer, computeHmac };

