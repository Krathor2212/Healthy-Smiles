const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, verifyCode, resetPassword, doctorLogin, savePushToken } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/doctor/login
router.post('/doctor/login', doctorLogin);

// POST /auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /auth/verify-code
router.post('/verify-code', verifyCode);

// POST /auth/reset-password
router.post('/reset-password', resetPassword);

// POST /api/auth/push-token - Save push notification token
router.post('/push-token', authenticateToken, savePushToken);

module.exports = router;
