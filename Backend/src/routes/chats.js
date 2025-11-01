const express = require('express');
const router = express.Router();
const { getChats, getChatMessages, sendMessage } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/chats
router.get('/', authenticateToken, getChats);

// GET /api/chats/:chatId/messages
router.get('/:chatId/messages', authenticateToken, getChatMessages);

// POST /api/chats/:chatId/messages
router.post('/:chatId/messages', authenticateToken, sendMessage);

module.exports = router;
