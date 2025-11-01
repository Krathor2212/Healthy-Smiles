const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointmentStatus } = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/appointments
router.get('/', authenticateToken, getAppointments);

// POST /api/appointments
router.post('/', authenticateToken, createAppointment);

// PATCH /api/appointments/:appointmentId
router.patch('/:appointmentId', authenticateToken, updateAppointmentStatus);

module.exports = router;
