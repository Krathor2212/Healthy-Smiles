const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * POST /api/admin/migrate-push-token
 * Run migration to add push_token column
 */
router.post('/migrate-push-token', async (req, res) => {
  try {
    // Add push_token column
    await db.query(`
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS push_token TEXT;
    `);

    // Add index
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_patients_push_token 
      ON patients(push_token) WHERE push_token IS NOT NULL;
    `);

    res.json({
      success: true,
      message: 'Migration completed successfully'
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: 'Migration failed: ' + error.message
    });
  }
});

module.exports = router;
