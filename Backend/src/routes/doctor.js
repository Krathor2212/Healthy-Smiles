const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  getPatientProfileForDoctor,
  getDoctorStats,
  getTodayAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  getPatients,
  searchMedicines
} = require('../controllers/doctorController');

// GET /api/doctor/stats
router.get('/stats', auth(true), getDoctorStats);

// GET /api/doctor/appointments/today
router.get('/appointments/today', auth(true), getTodayAppointments);

// GET /api/doctor/appointments
router.get('/appointments', auth(true), getAllAppointments);

// PATCH /api/doctor/appointments/:appointmentId
router.patch('/appointments/:appointmentId', auth(true), updateAppointmentStatus);

// GET /api/doctor/patients
router.get('/patients', auth(true), getPatients);

// GET /api/doctor/medicines
router.get('/medicines', auth(true), searchMedicines);

// GET /api/doctor/patients/:patientId/profile
router.get('/patients/:patientId/profile', auth(true), getPatientProfileForDoctor);

module.exports = router;
