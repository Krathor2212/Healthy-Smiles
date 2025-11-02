require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/db');
const { computeHmac } = require('../src/cryptoUtil');

async function testVadiveluLogin() {
  try {
    const email = 'vadivelu@example.com'; // Replace with the actual email you used
    const password = '123456'; // Replace with the actual password you used
    
    console.log('\n🔍 Testing login for:', email);
    console.log('================================\n');
    
    // Compute email HMAC (same as login does)
    const emailHmac = computeHmac(email);
    console.log('Email HMAC:', emailHmac);
    
    // Try to find doctor by email HMAC
    const result = await db.query(
      'SELECT id, password_hash, name_enc, email_enc, role FROM doctors WHERE email_hmac = $1',
      [emailHmac]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Doctor not found with this email!');
      console.log('\nTrying all doctors to find vadivelu...');
      
      const allDoctors = await db.query('SELECT id, email_enc, name_enc FROM doctors');
      const { decryptText } = require('../src/cryptoUtil');
      
      for (const doc of allDoctors.rows) {
        try {
          const name = decryptText(doc.name_enc);
          const docEmail = decryptText(doc.email_enc);
          console.log(`- ${name} (${docEmail})`);
        } catch (e) {
          console.log('- [Error decrypting]');
        }
      }
    } else {
      const doctor = result.rows[0];
      console.log('✅ Doctor found!');
      console.log('Doctor ID:', doctor.id);
      console.log('Role:', doctor.role);
      console.log('Password hash exists:', doctor.password_hash ? 'YES' : 'NO');
      console.log('Password hash length:', doctor.password_hash ? doctor.password_hash.length : 0);
      
      // Test password
      if (doctor.password_hash) {
        const isMatch = await bcrypt.compare(password, doctor.password_hash);
        console.log('\n🔐 Password comparison result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
        
        if (!isMatch) {
          console.log('\n⚠️  The password does not match!');
          console.log('This could mean:');
          console.log('1. You entered the wrong password');
          console.log('2. The password was not hashed correctly during creation');
        }
      } else {
        console.log('\n❌ No password hash stored for this doctor!');
      }
    }
    
    await db.end();
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testVadiveluLogin();
