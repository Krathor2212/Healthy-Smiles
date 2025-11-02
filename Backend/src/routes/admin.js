const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Admin login (public route)
router.post('/login', adminController.adminLogin);

// Protected admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// Doctor management
router.post('/doctors', adminController.createDoctor);
router.get('/doctors', adminController.getAllDoctors);
router.put('/doctors/:doctorId/hospitals', adminController.updateDoctorHospitals);
router.delete('/doctors/:doctorId', adminController.deleteDoctor);

// View patients (read-only)
router.get('/patients', adminController.getAllPatients);

// View medicines (read-only)
router.get('/medicines', adminController.getAllMedicines);

// Get hospitals
router.get('/hospitals', adminController.getAllHospitals);

module.exports = router;
