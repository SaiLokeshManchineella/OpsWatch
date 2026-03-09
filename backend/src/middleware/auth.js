// ── JWT Authentication Middleware ──────────────────────────
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'dev-secret';

/**
 * Middleware that verifies Bearer JWT token and attaches req.user
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ detail: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET);

        const { rows } = await pool.query(
            'SELECT id, username, name, email, role, is_active FROM users WHERE id = $1',
            [payload.sub]
        );

        if (rows.length === 0 || !rows[0].is_active) {
            return res.status(401).json({ detail: 'User not found or deactivated' });
        }

        req.user = rows[0];
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ detail: 'Invalid or expired token' });
        }
        next(err);
    }
};

module.exports = { authenticate };
