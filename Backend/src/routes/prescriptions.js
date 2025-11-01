const express = require('express');
const router = express.Router();
const { createPrescription, getDoctorPrescriptions, getPatientPrescriptions } = require('../controllers/prescriptionController');
const { auth } = require('../middleware/auth');

router.post('/prescriptions', auth(true), createPrescription);
router.get('/doctor/prescriptions', auth(true), getDoctorPrescriptions);
router.get('/patient/prescriptions', auth(true), getPatientPrescriptions);

module.exports = router;
