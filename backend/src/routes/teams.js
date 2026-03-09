// ── Team Routes ───────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const pool = require('../config/db');

// GET /teams
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT id, name, created_at FROM teams ORDER BY name');
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
