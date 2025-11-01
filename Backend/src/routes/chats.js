const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getChats, getChatMessages, sendMessage, initiateChat, uploadChatFile } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET /api/chats
router.get('/', authenticateToken, getChats);

// POST /api/chats/initiate - Start a new chat
router.post('/initiate', authenticateToken, initiateChat);

// GET /api/chats/:chatId/messages
router.get('/:chatId/messages', authenticateToken, getChatMessages);

// POST /api/chats/:chatId/messages
router.post('/:chatId/messages', authenticateToken, sendMessage);

// POST /api/chats/:chatId/upload - Upload file to chat
router.post('/:chatId/upload', authenticateToken, upload.single('file'), uploadChatFile);

module.exports = router;
