const express = require('express');
const router = express.Router();
const { getNotifications, updateNotification, sendTestNotification } = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticateToken, getNotifications);

// PATCH /api/notifications/:notificationId
router.patch('/:notificationId', authenticateToken, updateNotification);

// POST /api/notifications/test - Send a test notification
router.post('/test', authenticateToken, sendTestNotification);

module.exports = router;
