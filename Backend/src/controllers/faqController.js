const db = require('../db');

/**
 * GET /api/faqs
 * Get all FAQs (no authentication required)
 */
async function getFaqs(req, res) {
  try {
    const result = await db.query(`
      SELECT id, question, answer
      FROM faqs
      ORDER BY display_order, id
    `);

    const faqs = result.rows.map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer
    }));

    res.json({ faqs });
  } catch (err) {
    console.error('Get FAQs error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}

module.exports = { getFaqs };
