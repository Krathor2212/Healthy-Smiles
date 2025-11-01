const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { encryptText, decryptText } = require('../cryptoUtil');

/**
 * GET /api/doctor/chats
 * Get doctor's chat contacts (patients they're chatting with)
 */
async function getDoctorChats(req, res) {
  try {
    const doctorId = req.user.id; // Doctor's UUID from JWT

    // Get all chats where this doctor is involved
    const result = await db.query(`
      SELECT 
        cc.id, 
        cc.patient_id as "patientId",
        p.name_enc,
        cc.last_message_enc as "lastMessageEnc", 
        cc.last_message_time as "lastMessageTime",
        cc.unread_count as "unreadCount",
        cc.is_online as "isOnline"
      FROM chat_contacts cc
      JOIN patients p ON cc.patient_id = p.id
      WHERE cc.doctor_id = $1
      ORDER BY cc.last_message_time DESC NULLS LAST
    `, [doctorId]);

    const contacts = result.rows.map(chat => ({
      id: chat.id,
      patientId: chat.patientId,
      patientName: decryptText(chat.name_enc),
      patientAvatar: null, // Can add avatar later
      lastMessage: chat.lastMessageEnc ? decryptText(chat.lastMessageEnc) : '',
      lastMessageTime: chat.lastMessageTime ? formatTime(chat.lastMessageTime) : '',
      unreadCount: chat.unreadCount || 0,
      isOnline: chat.isOnline || false
    }));

    res.json({ contacts });
  } catch (err) {
    console.error('Get doctor chats error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * GET /api/doctor/chats/:chatId/messages
 * Get messages for a specific chat
 */
async function getChatMessages(req, res) {
  try {
    const doctorId = req.user.id;
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify doctor has access to this chat
    const chatResult = await db.query(
      'SELECT doctor_id, patient_id FROM chat_contacts WHERE id = $1',
      [chatId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Chat not found' 
      });
    }

    // Compare as strings (doctor_id is TEXT, doctorId is UUID)
    if (chatResult.rows[0].doctor_id !== doctorId.toString()) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

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
      if (msg.file_id && msg.filename_enc) {
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
        sender: msg.sender_type === 'doctor' ? 'doctor' : 'patient',
        createdAt: msg.created_at,
        file: fileData
      };
    });

    // Mark messages as read (reset unread count for doctor)
    await db.query(
      'UPDATE chat_contacts SET unread_count = 0 WHERE id = $1',
      [chatId]
    );

    res.json({ messages });
  } catch (err) {
    console.error('Get chat messages error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

/**
 * POST /api/doctor/chats/:chatId/messages
 * Send a message in a chat
 */
async function sendMessage(req, res) {
  try {
    const doctorId = req.user.id;
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Message text is required' 
      });
    }

    // Verify doctor has access to this chat
    const chatResult = await db.query(
      'SELECT doctor_id, patient_id FROM chat_contacts WHERE id = $1',
      [chatId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Chat not found' 
      });
    }

    // Compare as strings (doctor_id is TEXT, doctorId is UUID)
    if (chatResult.rows[0].doctor_id !== doctorId.toString()) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    const patientId = chatResult.rows[0].patient_id;

    // Encrypt and insert message
    const messageId = uuidv4();
    const textEnc = encryptText(text.trim());
    
    await db.query(`
      INSERT INTO messages (id, chat_id, sender_type, sender_id, text_enc, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [messageId, chatId, 'doctor', doctorId, textEnc]);

    // Update last message in chat_contacts
    await db.query(`
      UPDATE chat_contacts
      SET last_message_enc = $1, last_message_time = NOW()
      WHERE id = $2
    `, [textEnc, chatId]);

    // Create notification for patient
    await db.query(`
      INSERT INTO notifications (id, patient_id, title, description, type, icon_name, icon_color, related_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      uuidv4(),
      patientId,
      'New Message',
      `You have a new message from your doctor`,
      'chat',
      'chatbubble',
      '#0091F5',
      chatId
    ]);

    res.json({ 
      success: true,
      message: {
        id: messageId,
        text: text.trim(),
        time: formatTime(new Date()),
        sender: 'doctor',
        createdAt: new Date().toISOString()
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
 * POST /api/doctor/chats/initiate
 * Start a new chat with a patient
 */
async function initiateChat(req, res) {
  try {
    const doctorId = req.user.id;
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ 
        success: false,
        error: 'Patient ID is required' 
      });
    }

    // Check if chat already exists
    const existingChat = await db.query(
      'SELECT id FROM chat_contacts WHERE doctor_id = $1 AND patient_id = $2',
      [doctorId, patientId]
    );

    if (existingChat.rows.length > 0) {
      return res.json({ 
        success: true,
        chatId: existingChat.rows[0].id 
      });
    }

    // Get doctor info
    const doctorResult = await db.query(
      'SELECT name_enc, specialty_enc FROM doctors WHERE id = $1',
      [doctorId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Doctor not found' 
      });
    }

    const doctorName = decryptText(doctorResult.rows[0].name_enc);

    // Create new chat
    const chatId = uuidv4();
    await db.query(`
      INSERT INTO chat_contacts (id, patient_id, doctor_id, doctor_name, doctor_rating, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [chatId, patientId, doctorId, doctorName, 4.5]); // Default rating

    res.json({ 
      success: true,
      chatId 
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
 * Helper function to format time
 */
function formatTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

module.exports = {
  getDoctorChats,
  getChatMessages,
  sendMessage,
  initiateChat
};
