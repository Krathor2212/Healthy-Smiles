const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, registerPushToken } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/user/profile
router.get('/profile', authenticateToken, getProfile);

// PUT /api/user/profile
router.put('/profile', authenticateToken, updateProfile);

// POST /api/user/push-token
router.post('/push-token', authenticateToken, registerPushToken);

module.exports = router;
