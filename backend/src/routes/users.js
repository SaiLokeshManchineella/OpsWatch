// ── User Routes ───────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const pool = require('../config/db');

// GET /users/me
router.get('/me', authenticate, async (req, res) => {
    res.json(req.user);
});

// PUT /users/me
router.put('/me', authenticate, async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const fields = [];
        const params = [];
        let idx = 1;

        if (name) { fields.push(`name = $${idx++}`); params.push(name); }
        if (email) { fields.push(`email = $${idx++}`); params.push(email); }

        if (fields.length === 0) return res.json(req.user);

        fields.push(`updated_at = NOW()`);
        params.push(req.user.id);

        const { rows } = await pool.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, username, name, email, role, is_active, created_at, updated_at`,
            params
        );

        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
