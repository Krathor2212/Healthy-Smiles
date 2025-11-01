const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/login/google
router.post('/login/google', (req, res) => {
	// delegate to controller
	const { googleLogin } = require('../controllers/authController');
	return googleLogin(req, res);
});

module.exports = router;
