const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { encryptText, decryptText } = require('../cryptoUtil');

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

    // Get messages
    let query = `
      SELECT id, sender_type, sender_id, text_enc, created_at
      FROM messages
      WHERE chat_id = $1
    `;
    const params = [chatId];

    if (before) {
      query += ` AND created_at < (SELECT created_at FROM messages WHERE id = $${params.length + 1})`;
      params.push(before);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);

    // Reverse to get chronological order
    const messages = result.rows.reverse().map(msg => ({
      id: msg.id,
      text: decryptText(msg.text_enc),
      time: formatTime(msg.created_at),
      sender: msg.sender_type === 'patient' ? 'user' : 'doctor',
      createdAt: msg.created_at
    }));

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

module.exports = { getChats, getChatMessages, sendMessage };
