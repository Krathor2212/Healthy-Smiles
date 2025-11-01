const crypto = require('crypto');
const bigInt = require('big-integer');
const forge = require('node-forge');
const jwt = require('jsonwebtoken');
const db = require('./db');

class DiffieHellmanChat {
  constructor(io) {
    this.io = io;
    this.sessions = new Map(); // Store DH sessions by socket ID
    this.userSockets = new Map(); // Map user IDs to socket IDs
  }

  /**
   * Initialize Socket.io connection handlers
   */
  initialize() {
    this.io.on('connection', (socket) => {
      console.log('New WebSocket connection:', socket.id);
      
      // Authenticate user from token
      const token = socket.handshake.auth.token;
      const user = this.verifyToken(token);
      
      if (!user) {
        console.log('Authentication failed for socket:', socket.id);
        socket.emit('error', { message: 'Authentication failed' });
        socket.disconnect();
        return;
      }
      
      socket.userId = user.id;
      socket.userRole = user.role;
      this.userSockets.set(user.id, socket.id);
      
      console.log(`User ${user.id} connected with socket ${socket.id}`);
      
      // Initialize Diffie-Hellman key exchange
      this.initializeDH(socket);
      
      // Handle message sending
      socket.on('send-message', (data) => this.handleMessage(socket, data));
      
      // Handle typing indicator
      socket.on('typing', (data) => this.handleTyping(socket, data));
      
      // Handle disconnect
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Object|null} User object or null
   */
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'devsecret';
      return jwt.verify(token, secret);
    } catch (error) {
      console.error('Token verification error:', error.message);
      return null;
    }
  }

  /**
   * Initialize Diffie-Hellman key exchange with client
   * @param {Socket} socket - Socket.io socket
   */
  initializeDH(socket) {
    // Generate large prime p and generator g (using smaller values for demo)
    const bits = 2048;
    const p = this.generatePrime(bits);
    const g = bigInt(2);
    
    // Generate server's private key (a)
    const a = this.randomInRange(bigInt(1), p.subtract(2));
    
    // Calculate server's public key (A = g^a mod p)
    const A = g.modPow(a, p);
    
    // Store session
    this.sessions.set(socket.id, {
      p,
      g,
      a,
      A,
      sharedSecret: null
    });
    
    // Send DH parameters to client
    socket.emit('dh-init', {
      p: p.toString(),
      g: g.toString(),
      A: A.toString()
    });
    
    console.log(`Sent DH-init to socket ${socket.id}`);
    
    // Handle client response with their public key
    socket.once('dh-response', ({ B }) => {
      const session = this.sessions.get(socket.id);
      
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }
      
      const clientPublicKey = bigInt(B);
      
      // Calculate shared secret (s = B^a mod p)
      const sharedSecret = clientPublicKey.modPow(session.a, session.p);
      
      session.sharedSecret = sharedSecret.toString();
      this.sessions.set(socket.id, session);
      
      console.log(`Secure connection established for user ${socket.userId}`);
      socket.emit('encryption-ready');
    });
  }

  /**
   * Handle incoming message from client
   * @param {Socket} socket - Socket.io socket
   * @param {Object} data - { chatId, encryptedData, iv }
   */
  async handleMessage(socket, { chatId, encryptedData, iv }) {
    const session = this.sessions.get(socket.id);
    
    if (!session || !session.sharedSecret) {
      socket.emit('error', { message: 'Encryption not initialized' });
      return;
    }
    
    try {
      // Decrypt message using shared secret
      const decryptedText = this.decryptAES(encryptedData, session.sharedSecret, iv);
      
      console.log(`Message from ${socket.userId}: ${decryptedText}`);
      
      // Store message in database
      const messageId = await this.storeMessage(chatId, socket.userId, socket.userRole, decryptedText);
      
      // Get recipient info
      const recipient = await this.getRecipient(chatId, socket.userId);
      
      if (recipient) {
        const recipientSocketId = this.userSockets.get(recipient.id);
        
        if (recipientSocketId) {
          const recipientSocket = this.io.sockets.sockets.get(recipientSocketId);
          const recipientSession = this.sessions.get(recipientSocketId);
          
          if (recipientSocket && recipientSession && recipientSession.sharedSecret) {
            // Re-encrypt with recipient's shared secret
            const { encrypted, iv: newIv } = this.encryptAES(
              decryptedText,
              recipientSession.sharedSecret
            );
            
            // Send to recipient
            recipientSocket.emit('message', {
              chatId,
              messageId,
              encryptedData: encrypted,
              iv: newIv,
              sender: socket.userId,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
      
      // Confirm to sender
      socket.emit('message-sent', { 
        messageId, 
        chatId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Message handling error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Encrypt text using AES-256-CBC with shared secret
   * @param {String} text - Text to encrypt
   * @param {String} sharedSecret - DH shared secret
   * @returns {Object} { encrypted, iv }
   */
  encryptAES(text, sharedSecret) {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(sharedSecret).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  /**
   * Decrypt text using AES-256-CBC with shared secret
   * @param {String} encryptedData - Base64 encrypted data
   * @param {String} sharedSecret - DH shared secret
   * @param {String} ivHex - IV in hex
   * @returns {String} Decrypted text
   */
  decryptAES(encryptedData, sharedSecret, ivHex) {
    const key = crypto.createHash('sha256').update(sharedSecret).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate a large prime number
   * @param {Number} bits - Number of bits
   * @returns {BigInteger} Large prime number
   */
  generatePrime(bits) {
    // Use node-forge to generate prime
    const prime = forge.prime.generateProbablePrime(bits);
    return bigInt(prime.toString(10));
  }

  /**
   * Generate random number in range [min, max]
   * @param {BigInteger} min - Minimum value
   * @param {BigInteger} max - Maximum value
   * @returns {BigInteger} Random number
   */
  randomInRange(min, max) {
    const range = max.subtract(min);
    const randomBytes = crypto.randomBytes(32);
    const randomNum = bigInt(randomBytes.toString('hex'), 16);
    return randomNum.mod(range).add(min);
  }

  /**
   * Store message in database
   * @param {String} chatId - Chat ID
   * @param {String} userId - User ID
   * @param {String} userRole - User role (patient/doctor)
   * @param {String} text - Message text (plaintext)
   * @returns {String} Message ID
   */
  async storeMessage(chatId, userId, userRole, text) {
    const { encryptText } = require('./cryptoUtil');
    const { v4: uuidv4 } = require('uuid');
    
    const messageId = uuidv4();
    const textEnc = encryptText(text);
    
    await db.query(
      `INSERT INTO messages (id, chat_id, sender_type, sender_id, text_enc, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [messageId, chatId, userRole, userId, textEnc]
    );
    
    // Update last message in chat_contacts
    await db.query(
      `UPDATE chat_contacts 
       SET last_message_enc = $1, last_message_time = NOW()
       WHERE id = $2`,
      [textEnc, chatId]
    );
    
    return messageId;
  }

  /**
   * Get recipient info from chat
   * @param {String} chatId - Chat ID
   * @param {String} senderId - Sender user ID
   * @returns {Object|null} Recipient info
   */
  async getRecipient(chatId, senderId) {
    const result = await db.query(
      `SELECT patient_id, doctor_id FROM chat_contacts WHERE id = $1`,
      [chatId]
    );
    
    if (result.rows.length === 0) return null;
    
    const { patient_id, doctor_id } = result.rows[0];
    
    // Return the ID that is not the sender
    if (patient_id === senderId) {
      return { id: doctor_id, role: 'doctor' };
    } else {
      return { id: patient_id, role: 'patient' };
    }
  }

  /**
   * Handle typing indicator
   * @param {Socket} socket - Socket.io socket
   * @param {Object} data - { chatId, isTyping }
   */
  async handleTyping(socket, { chatId, isTyping }) {
    try {
      const recipient = await this.getRecipient(chatId, socket.userId);
      
      if (recipient) {
        const recipientSocketId = this.userSockets.get(recipient.id);
        
        if (recipientSocketId) {
          const recipientSocket = this.io.sockets.sockets.get(recipientSocketId);
          
          if (recipientSocket) {
            recipientSocket.emit('typing', {
              chatId,
              userId: socket.userId,
              isTyping
            });
          }
        }
      }
    } catch (error) {
      console.error('Typing indicator error:', error);
    }
  }

  /**
   * Handle client disconnect
   * @param {Socket} socket - Socket.io socket
   */
  handleDisconnect(socket) {
    this.sessions.delete(socket.id);
    
    if (socket.userId) {
      this.userSockets.delete(socket.userId);
    }
    
    console.log(`User ${socket.userId} disconnected (socket ${socket.id})`);
  }
}

module.exports = DiffieHellmanChat;
