const crypto = require('crypto');
const bigInt = require('big-integer');
const forge = require('node-forge');

class ElGamalCrypto {
  /**
   * Generate El Gamal key pair
   * @returns {Object} { publicKey: {p, g, y}, privateKey: {x, p} }
   */
  static async generateKeyPair() {
    // Generate large prime p (2048 bits for security)
    const p = await this.generateLargePrime(256); // Using 256 bytes = 2048 bits
    
    // Choose generator g
    const g = bigInt(2);
    
    // Generate private key x (random number between 1 and p-2)
    const x = this.randomInRange(bigInt(1), p.subtract(2));
    
    // Calculate public key y = g^x mod p
    const y = g.modPow(x, p);
    
    return {
      publicKey: { 
        p: p.toString(), 
        g: g.toString(), 
        y: y.toString() 
      },
      privateKey: { 
        x: x.toString(), 
        p: p.toString() 
      }
    };
  }

  /**
   * Encrypt file buffer using El Gamal
   * @param {Buffer} fileBuffer - The file data to encrypt
   * @param {Object} publicKey - El Gamal public key {p, g, y}
   * @returns {Object} { c1, c2 } - Ciphertext components
   */
  static encryptFile(fileBuffer, publicKey) {
    const p = bigInt(publicKey.p);
    const g = bigInt(publicKey.g);
    const y = bigInt(publicKey.y);
    
    // Convert file buffer to hex string then to big integer
    const message = bigInt(fileBuffer.toString('hex'), 16);
    
    // Ensure message is smaller than p
    if (message.greaterOrEquals(p)) {
      throw new Error('Message too large for current key size');
    }
    
    // Generate random k (ephemeral key)
    const k = this.randomInRange(bigInt(1), p.subtract(2));
    
    // Calculate c1 = g^k mod p
    const c1 = g.modPow(k, p);
    
    // Calculate c2 = m * y^k mod p
    const c2 = message.multiply(y.modPow(k, p)).mod(p);
    
    return {
      c1: c1.toString(),
      c2: c2.toString()
    };
  }

  /**
   * Decrypt file using El Gamal
   * @param {Object} ciphertext - { c1, c2 }
   * @param {Object} privateKey - El Gamal private key {x, p}
   * @returns {Buffer} Decrypted file buffer
   */
  static decryptFile(ciphertext, privateKey) {
    const p = bigInt(privateKey.p);
    const x = bigInt(privateKey.x);
    const c1 = bigInt(ciphertext.c1);
    const c2 = bigInt(ciphertext.c2);
    
    // Calculate s = c1^x mod p
    const s = c1.modPow(x, p);
    
    // Calculate s^(-1) mod p (modular multiplicative inverse)
    const s_inv = s.modInv(p);
    
    // Calculate m = c2 * s^(-1) mod p
    const message = c2.multiply(s_inv).mod(p);
    
    // Convert big integer back to hex string then to buffer
    let hexMessage = message.toString(16);
    
    // Ensure even length for hex string
    if (hexMessage.length % 2 !== 0) {
      hexMessage = '0' + hexMessage;
    }
    
    return Buffer.from(hexMessage, 'hex');
  }

  /**
   * Generate a large prime number using Node Forge
   * @param {Number} bytes - Number of bytes (bits = bytes * 8)
   * @returns {BigInteger} Large prime number
   */
  static generateLargePrime(bytes) {
    const bits = bytes * 8;
    
    // Use node-forge to generate prime with callback
    return new Promise((resolve, reject) => {
      forge.prime.generateProbablePrime(bits, (err, prime) => {
        if (err) {
          reject(err);
        } else {
          // Convert forge BigInteger to string then to big-integer
          resolve(bigInt(prime.toString(10)));
        }
      });
    });
  }

  /**
   * Generate random number in range [min, max]
   * @param {BigInteger} min - Minimum value
   * @param {BigInteger} max - Maximum value
   * @returns {BigInteger} Random number
   */
  static randomInRange(min, max) {
    const range = max.subtract(min);
    
    // Generate random bytes (32 bytes = 256 bits)
    const randomBytes = crypto.randomBytes(32);
    const randomNum = bigInt(randomBytes.toString('hex'), 16);
    
    // Map to range: (randomNum % range) + min
    return randomNum.mod(range).add(min);
  }

  /**
   * Chunk large files for encryption
   * @param {Buffer} fileBuffer - File to chunk
   * @param {Number} chunkSize - Size of each chunk in bytes
   * @returns {Array<Buffer>} Array of chunks
   */
  static chunkBuffer(fileBuffer, chunkSize = 200) {
    const chunks = [];
    for (let i = 0; i < fileBuffer.length; i += chunkSize) {
      chunks.push(fileBuffer.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Encrypt large file in chunks
   * @param {Buffer} fileBuffer - File to encrypt
   * @param {Object} publicKey - El Gamal public key
   * @returns {Array<Object>} Array of encrypted chunks
   */
  static encryptLargeFile(fileBuffer, publicKey) {
    const chunks = this.chunkBuffer(fileBuffer);
    return chunks.map(chunk => this.encryptFile(chunk, publicKey));
  }

  /**
   * Decrypt large file from chunks
   * @param {Array<Object>} encryptedChunks - Array of {c1, c2}
   * @param {Object} privateKey - El Gamal private key
   * @returns {Buffer} Decrypted file buffer
   */
  static decryptLargeFile(encryptedChunks, privateKey) {
    const decryptedChunks = encryptedChunks.map(chunk => 
      this.decryptFile(chunk, privateKey)
    );
    return Buffer.concat(decryptedChunks);
  }
}

module.exports = ElGamalCrypto;
