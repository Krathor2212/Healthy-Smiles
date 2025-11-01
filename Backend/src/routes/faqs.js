const express = require('express');
const router = express.Router();
const { getFaqs } = require('../controllers/faqController');

// GET /api/faqs (no authentication required)
router.get('/', getFaqs);

module.exports = router;
