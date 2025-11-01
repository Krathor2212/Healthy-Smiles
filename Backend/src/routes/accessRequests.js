const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createAccessRequest,
  getAccessRequests,
  respondToAccessRequest,
  getAuditLog
} = require('../controllers/accessRequestController');

// Access request routes
router.post('/request', authenticateToken, createAccessRequest);
router.get('/requests', authenticateToken, getAccessRequests);
router.post('/requests/:requestId/respond', authenticateToken, respondToAccessRequest);

// Audit log route
router.get('/audit-log', authenticateToken, getAuditLog);

module.exports = router;
