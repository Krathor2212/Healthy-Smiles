require('dotenv').config();
const db = require('../src/db');
const ElGamalCrypto = require('../src/elgamalCrypto');
const { encryptText } = require('../src/cryptoUtil');

async function generateDoctorKeys() {
  try {
    console.log('🔑 Generating El Gamal keys for doctors...');
    
    // Get all doctors without El Gamal keys
    const result = await db.query(
      'SELECT id, name_enc FROM doctors WHERE elgamal_public_key IS NULL OR elgamal_private_key_enc IS NULL'
    );
    
    if (result.rows.length === 0) {
      console.log('✅ All doctors already have El Gamal keys!');
      process.exit(0);
    }
    
    console.log(`📋 Found ${result.rows.length} doctor(s) without keys`);
    
    for (const doctor of result.rows) {
      console.log(`   Generating keys for doctor ${doctor.id}...`);
      
      // Generate El Gamal key pair
      const keyPair = await ElGamalCrypto.generateKeyPair();
      
      // Encrypt the private key with AES before storing
      const privateKeyString = JSON.stringify(keyPair.privateKey);
      const encryptedPrivateKey = encryptText(privateKeyString);
      
      // Store the keys in the database
      await db.query(
        'UPDATE doctors SET elgamal_public_key = $1, elgamal_private_key_enc = $2 WHERE id = $3',
        [JSON.stringify(keyPair.publicKey), encryptedPrivateKey, doctor.id]
      );
      
      console.log(`   ✓ Keys generated for doctor ${doctor.id}`);
    }
    
    console.log(`\n✅ Successfully generated El Gamal keys for ${result.rows.length} doctor(s)!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Key generation failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

generateDoctorKeys();
