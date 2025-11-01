const express = require('express');
const router = express.Router();
const { getPayments } = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/payments
router.get('/', authenticateToken, getPayments);

module.exports = router;
