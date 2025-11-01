const express = require('express');
const router = express.Router();
const { getNotifications, updateNotification } = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticateToken, getNotifications);

// PATCH /api/notifications/:notificationId
router.patch('/:notificationId', authenticateToken, updateNotification);

module.exports = router;
