const db = require('../src/db');
const { decryptText } = require('../src/cryptoUtil');

async function checkVadivelu() {
  try {
    const result = await db.query(`
      SELECT id, email_enc, name_enc, password_hash, role, created_at 
      FROM doctors 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 Recent doctors in database:');
    console.log('================================\n');
    
    for (const doc of result.rows) {
      try {
        const name = decryptText(doc.name_enc);
        const email = decryptText(doc.email_enc);
        
        console.log(`Doctor ID: ${doc.id}`);
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Role: ${doc.role}`);
        console.log(`Has password hash: ${doc.password_hash ? 'YES' : 'NO'}`);
        console.log(`Password hash length: ${doc.password_hash ? doc.password_hash.length : 0}`);
        console.log(`Created: ${doc.created_at}`);
        console.log('---');
      } catch (e) {
        console.error('Decryption error for doctor:', e.message);
      }
    }
    
    await db.end();
  } catch (err) {
    console.error('Query error:', err);
    process.exit(1);
  }
}

checkVadivelu();
