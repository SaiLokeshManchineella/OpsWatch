// ── Auth Routes ───────────────────────────────────────────
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// POST /login
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ detail: 'Username and password are required' });
        }

        const user = await authService.authenticateUser(username, password);
        const tokens = authService.generateTokens(user.id);
        res.json(tokens);
    } catch (err) {
        next(err);
    }
});

// POST /register
router.post('/register', async (req, res, next) => {
    try {
        const { username, name, email, password } = req.body;
        if (!username || !name || !email || !password) {
            return res.status(400).json({ detail: 'All fields are required' });
        }

        const user = await authService.registerUser({ username, name, email, password });
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
});

// POST /auth/refresh
router.post('/refresh', async (req, res, next) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) {
            return res.status(400).json({ detail: 'refresh_token is required' });
        }

        const tokens = await authService.refreshUserToken(refresh_token);
        res.json(tokens);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
