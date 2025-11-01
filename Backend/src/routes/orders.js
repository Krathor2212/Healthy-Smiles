const express = require('express');
const router = express.Router();
const { getOrders, createOrder } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/orders
router.get('/', authenticateToken, getOrders);

// POST /api/orders
router.post('/', authenticateToken, createOrder);

module.exports = router;
