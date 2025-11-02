const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { encryptText, decryptText } = require('../cryptoUtil');
const ElGamalCrypto = require('../elgamalCrypto');

/**
 * GET /api/chats
 * Get user's chat contacts
 */
async function getChats(req, res) {
  try {
    const userId = req.user.id;

    const result = await db.query(`
      SELECT id, doctor_id, doctor_name, doctor_avatar, doctor_rating,
             last_message_enc, last_message_time, unread_count, is_online
      FROM chat_contacts
      WHERE patient_id = $1
      ORDER BY last_message_time DESC NULLS LAST
    `, [userId]);

    // Update missing avatars from doctors table
    for (const chat of result.rows) {
      if (!chat.doctor_avatar && chat.doctor_id) {
        const doctorResult = await db.query(
          'SELECT profile_photo FROM doctors WHERE id = $1',
          [chat.doctor_id]
        );
        if (doctorResult.rows.length > 0) {
          const avatar = doctorResult.rows[0].profile_photo || '';
          await db.query(
            'UPDATE chat_contacts SET doctor_avatar = $1 WHERE id = $2',
            [avatar, chat.id]
          );
          chat.doctor_avatar = avatar;
        }
      }
    }

    const contacts = result.rows.map(chat => ({
      id: chat.id,
      doctorId: chat.doctor_id,
      doctorName: chat.doctor_name,
      doctorAvatar: chat.doctor_avatar,
      doctorRating: parseFloat(chat.doctor_rating) || 0,
      lastMessage: chat.last_message_enc ? decryptText(chat.last_message_enc) : '',
      lastMessageTime: chat.last_message_time ? formatTime(chat.last_message_time) : '',
      unreadCount: chat.unread_count || 0,
      isOnline: chat.is_online || false
    }));

    res.json({ contacts });
  } catch (err) {
    console.error('Get chats error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * GET /api/chats/:chatId/messages
 * Get messages for a specific chat
 */
async function getChatMessages(req, res) {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user has access to this chat
    const chatResult = await db.query(
      'SELECT patient_id, doctor_name, doctor_avatar FROM chat_contacts WHERE id = $1',
      [chatId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Chat not found' 
      });
    }

    if (chatResult.rows[0].patient_id !== userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    const chat = chatResult.rows[0];

    // Get messages with file attachments
    let query = `
      SELECT 
        m.id,
        m.sender_type,
        m.sender_id,
        m.text_enc,
        m.created_at,
        m.file_id,
        mf.filename_enc,
        mf.mime_type,
        mf.file_size
      FROM messages m
      LEFT JOIN medical_files mf ON m.file_id = mf.id
      WHERE m.chat_id = $1
    `;
    const params = [chatId];

    if (before) {
      query += ` AND m.created_at < (SELECT created_at FROM messages WHERE id = $${params.length + 1})`;
      params.push(before);
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);

    // Reverse to get chronological order
    const messages = result.rows.reverse().map(msg => {
      let fileData = null;
      if (msg.file_id) {
        const decryptedFilename = decryptText(msg.filename_enc);
        fileData = {
          id: msg.file_id,
          name: decryptedFilename,
          mimeType: msg.mime_type,
          size: msg.file_size,
          url: `/api/files/${msg.file_id}`
        };
      }

      return {
        id: msg.id,
        text: msg.text_enc ? decryptText(msg.text_enc) : '',
        time: formatTime(msg.created_at),
        sender: msg.sender_type, // 'patient' or 'doctor'
        createdAt: msg.created_at,
        file: fileData
      };
    });

    res.json({
      chatId,
      doctorName: chat.doctor_name,
      doctorAvatar: chat.doctor_avatar,
      messages,
      hasMore: result.rows.length === parseInt(limit)
    });
  } catch (err) {
    console.error('Get chat messages error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * POST /api/chats/:chatId/messages
 * Send a message (HTTP fallback - WebSocket preferred)
 */
async function sendMessage(req, res) {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ 
        success: false,
        error: 'Message text is required' 
      });
    }

    // Verify user has access to this chat
    const chatResult = await db.query(
      'SELECT patient_id FROM chat_contacts WHERE id = $1',
      [chatId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Chat not found' 
      });
    }

    if (chatResult.rows[0].patient_id !== userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    // Insert message
    const messageId = uuidv4();
    const textEnc = encryptText(text);
    const now = new Date();

    await db.query(`
      INSERT INTO messages (id, chat_id, sender_type, sender_id, text_enc, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [messageId, chatId, 'patient', userId, textEnc, now]);

    // Update last message in chat
    await db.query(`
      UPDATE chat_contacts
      SET last_message_enc = $1, last_message_time = $2
      WHERE id = $3
    `, [textEnc, now, chatId]);

    res.status(201).json({
      success: true,
      message: {
        id: messageId,
        text,
        time: formatTime(now),
        sender: 'user',
        createdAt: now
      }
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Today - show time
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * POST /api/chats/initiate
 * Initiate a new chat with a doctor
 */
async function initiateChat(req, res) {
  try {
    const patientId = req.user.id;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        error: 'Doctor ID is required'
      });
    }

    // Check if doctorId is from doctors_data (TEXT) or doctors (UUID)
    let actualDoctorId = doctorId;
    let doctorName = 'Doctor';
    let doctorAvatar = '';
    
    // Check if it's a UUID or TEXT ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(doctorId);

    if (!isUUID) {
      // It's a TEXT ID from doctors_data, look up the linked doctor UUID
      const doctorDataResult = await db.query(
        'SELECT doctor_id, name FROM doctors_data WHERE id = $1',
        [doctorId]
      );

      if (doctorDataResult.rows.length > 0) {
        doctorName = doctorDataResult.rows[0].name;
        // Use the linked UUID if available
        if (doctorDataResult.rows[0].doctor_id) {
          actualDoctorId = doctorDataResult.rows[0].doctor_id;
          
          // Get profile photo from the actual doctor
          const doctorResult = await db.query(
            'SELECT name_enc, profile_photo FROM doctors WHERE id = $1',
            [actualDoctorId]
          );
          if (doctorResult.rows.length > 0) {
            doctorName = decryptText(doctorResult.rows[0].name_enc);
            doctorAvatar = doctorResult.rows[0].profile_photo || '';
          }
        } else {
          // Doctor not linked yet - keep the TEXT ID for now
          console.warn(`Doctor ${doctorId} from doctors_data is not linked to doctors table`);
        }
      } else {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }
    } else {
      // It's already a UUID, get the doctor name and avatar
      const doctorResult = await db.query(
        'SELECT name_enc, profile_photo FROM doctors WHERE id = $1',
        [doctorId]
      );
      if (doctorResult.rows.length > 0) {
        doctorName = decryptText(doctorResult.rows[0].name_enc);
        doctorAvatar = doctorResult.rows[0].profile_photo || '';
      }
    }

    // Check if chat already exists
    const existingChat = await db.query(
      'SELECT id FROM chat_contacts WHERE patient_id = $1 AND doctor_id = $2',
      [patientId, actualDoctorId]
    );

    if (existingChat.rows.length > 0) {
      return res.json({ 
        success: true,
        chat: {
          id: existingChat.rows[0].id
        }
      });
    }

    // Create new chat
    const chatId = uuidv4();
    await db.query(`
      INSERT INTO chat_contacts (id, patient_id, doctor_id, doctor_name, doctor_avatar, doctor_rating, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [chatId, patientId, actualDoctorId, doctorName, doctorAvatar, 4.5]); // Default rating

    res.json({ 
      success: true,
      chat: {
        id: chatId
      }
    });
  } catch (err) {
    console.error('Initiate chat error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * POST /api/chats/:chatId/upload
 * Upload a file to a chat
 */
async function uploadChatFile(req, res) {
  try {
    const patientId = req.user.id;
    const { chatId } = req.params;

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file provided' 
      });
    }

    // Verify patient has access to this chat
    const chatResult = await db.query(
      'SELECT patient_id, doctor_id FROM chat_contacts WHERE id = $1',
      [chatId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Chat not found' 
      });
    }

    if (chatResult.rows[0].patient_id !== patientId) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    // Get patient's El Gamal public key
    const patientResult = await db.query(
      'SELECT elgamal_public_key FROM patients WHERE id = $1',
      [patientId]
    );

    if (patientResult.rows.length === 0 || !patientResult.rows[0].elgamal_public_key) {
      return res.status(400).json({ 
        success: false,
        error: 'Patient encryption keys not found' 
      });
    }

    const publicKey = patientResult.rows[0].elgamal_public_key;
    const fileBuffer = req.file.buffer;
    const fileSize = fileBuffer.length;

    // Encrypt file with El Gamal
    let encrypted;
    if (fileSize > 200) {
      const encryptedChunks = ElGamalCrypto.encryptLargeFile(fileBuffer, publicKey);
      encrypted = {
        c1: JSON.stringify(encryptedChunks.map(c => c.c1)),
        c2: JSON.stringify(encryptedChunks.map(c => c.c2))
      };
    } else {
      encrypted = ElGamalCrypto.encryptFile(fileBuffer, publicKey);
      encrypted.c1 = JSON.stringify([encrypted.c1]);
      encrypted.c2 = JSON.stringify([encrypted.c2]);
    }

    // Encrypt filename and description
    const filename = req.file.originalname;
    const filenameEnc = encryptText(filename);
    const descriptionEnc = req.body.description ? encryptText(req.body.description) : null;

    // Insert file record
    const fileId = uuidv4();
    await db.query(`
      INSERT INTO medical_files (
        id, patient_id, uploaded_by_role, uploaded_by_id, 
        filename_enc, description_enc, mime_type, file_size,
        encrypted_c1, encrypted_c2, chat_id, uploaded_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    `, [
      fileId, patientId, 'patient', patientId,
      filenameEnc, descriptionEnc, req.file.mimetype, fileSize,
      encrypted.c1, encrypted.c2, chatId
    ]);

    // Create a message with the file
    const messageId = uuidv4();
    const messageText = req.body.text || '';
    const textEnc = messageText ? encryptText(messageText) : null;

    await db.query(`
      INSERT INTO messages (id, chat_id, sender_type, sender_id, text_enc, file_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [messageId, chatId, 'patient', patientId, textEnc, fileId]);

    // Update last message in chat_contacts
    const lastMsg = messageText || `📎 ${filename}`;
    await db.query(`
      UPDATE chat_contacts 
      SET last_message_enc = $1, last_message_time = NOW()
      WHERE id = $2
    `, [encryptText(lastMsg), chatId]);

    // Note: Doctor notifications are not supported in current schema
    // Notifications table only has patient_id, not a generic user_id
    // Doctors will see the new file when they check the chat

    res.json({ 
      success: true,
      file: {
        id: fileId,
        name: filename,
        size: fileSize,
        mimeType: req.file.mimetype
      },
      message: {
        id: messageId
      }
    });
  } catch (err) {
    console.error('Upload chat file error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

module.exports = { getChats, getChatMessages, sendMessage, initiateChat, uploadChatFile };
