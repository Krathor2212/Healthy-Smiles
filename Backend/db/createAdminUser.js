const db = require('../src/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { encryptText, computeHmac } = require('../src/cryptoUtil');

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    const email = 'admin@medics.com';
    const password = 'Admin123!';
    const name = 'System Administrator';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Encrypt and hash email
    const emailEnc = encryptText(email);
    const emailHmac = computeHmac(email);

    // Encrypt name
    const nameEnc = encryptText(name);

    // Check if admin already exists
    const checkQuery = 'SELECT id FROM admins WHERE email_hmac = $1';
    const existingAdmin = await db.query(checkQuery, [emailHmac]);

    if (existingAdmin.rows.length > 0) {
      console.log('✓ Admin user already exists:', email);
      console.log('  ID:', existingAdmin.rows[0].id);
      return;
    }

    // Insert admin
    const insertQuery = `
      INSERT INTO admins (id, email_enc, email_hmac, password_hash, name_enc, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `;

    const adminId = uuidv4();
    const result = await db.query(insertQuery, [
      adminId,
      emailEnc,
      emailHmac,
      passwordHash,
      nameEnc
    ]);

    console.log('✓ Admin user created successfully!');
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('  ID:', result.rows[0].id);
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('Error creating admin user:', error.message);
    throw error;
  } finally {
    await db.end();
  }
}

createAdminUser();
