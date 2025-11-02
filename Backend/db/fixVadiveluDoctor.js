require('dotenv').config();
const db = require('../src/db');
const { decryptText, computeHmac } = require('../src/cryptoUtil');

async function fixVadiveluDoctor() {
  try {
    console.log('\n🔧 Fixing vadivelu doctor email HMAC...\n');
    
    // Find all doctors
    const result = await db.query('SELECT id, email_enc, name_enc, email_hmac FROM doctors');
    
    console.log(`Found ${result.rows.length} doctors in database:\n`);
    
    let vadiveluFound = false;
    
    for (const doctor of result.rows) {
      try {
        const name = decryptText(doctor.name_enc);
        const email = decryptText(doctor.email_enc);
        
        console.log(`Doctor: ${name} (${email})`);
        console.log(`  Current email_hmac: ${doctor.email_hmac}`);
        
        // Check if this is vadivelu
        if (name.toLowerCase().includes('vadivelu')) {
          vadiveluFound = true;
          console.log(`  ⭐ Found vadivelu!`);
          
          // Compute correct HMAC
          const correctHmac = computeHmac(email.toLowerCase());
          console.log(`  Correct email_hmac: ${correctHmac}`);
          
          if (doctor.email_hmac !== correctHmac) {
            console.log(`  ❌ HMAC mismatch! Fixing...`);
            
            // Update the email_hmac
            await db.query(
              'UPDATE doctors SET email_hmac = $1 WHERE id = $2',
              [correctHmac, doctor.id]
            );
            
            console.log(`  ✅ Updated email_hmac for vadivelu!`);
          } else {
            console.log(`  ✅ HMAC is already correct!`);
          }
        }
        
        console.log('');
      } catch (e) {
        console.error(`  Error processing doctor: ${e.message}\n`);
      }
    }
    
    if (!vadiveluFound) {
      console.log('⚠️  No doctor named "vadivelu" found!');
      console.log('Please check the name you used when creating the doctor.');
    } else {
      console.log('✅ Fix complete! Try logging in now.');
    }
    
    await db.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixVadiveluDoctor();
