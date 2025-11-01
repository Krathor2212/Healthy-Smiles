const express = require('express');
const router = express.Router();
const { getAppData } = require('../controllers/appDataController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/app-data
router.get('/app-data', authenticateToken, getAppData);

module.exports = router;
