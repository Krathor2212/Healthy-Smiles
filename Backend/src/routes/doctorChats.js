const express = require('express');
const router = express.Router();
const doctorChatController = require('../controllers/doctorChatController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/doctor/chats - Get doctor's chat contacts
router.get('/chats', authenticateToken, doctorChatController.getDoctorChats);

// GET /api/doctor/chats/:chatId/messages - Get messages for a specific chat
router.get('/chats/:chatId/messages', authenticateToken, doctorChatController.getChatMessages);

// POST /api/doctor/chats/:chatId/messages - Send a message
router.post('/chats/:chatId/messages', authenticateToken, doctorChatController.sendMessage);

// POST /api/doctor/chats/initiate - Start a new chat with a patient
router.post('/chats/initiate', authenticateToken, doctorChatController.initiateChat);

module.exports = router;
