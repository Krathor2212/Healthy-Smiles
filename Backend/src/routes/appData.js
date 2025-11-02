const express = require('express');
const router = express.Router();
const { getAppData, getHospitalDoctors } = require('../controllers/appDataController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/app-data
router.get('/app-data', authenticateToken, getAppData);

// GET /api/hospitals/:hospitalId/doctors
router.get('/hospitals/:hospitalId/doctors', authenticateToken, getHospitalDoctors);

module.exports = router;
