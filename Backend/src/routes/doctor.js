const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getPatientProfileForDoctor } = require('../controllers/doctorController');

// GET /api/doctor/patients/:patientId/profile
router.get('/patients/:patientId/profile', auth(true), getPatientProfileForDoctor);

module.exports = router;
