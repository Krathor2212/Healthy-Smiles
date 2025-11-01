const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  grantDoctorAccess,
  revokeDoctorAccess,
  getAuthorizations
} = require('../controllers/authorizationController');

// POST /api/authorizations/grant - Patient grants doctor access
router.post('/grant', authenticateToken, grantDoctorAccess);

// DELETE /api/authorizations/revoke/:doctorId - Patient revokes doctor access
router.delete('/revoke/:doctorId', authenticateToken, revokeDoctorAccess);

// GET /api/authorizations - Get list of authorizations
router.get('/', authenticateToken, getAuthorizations);

module.exports = router;
