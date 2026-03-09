// ── Dashboard Routes ──────────────────────────────────────
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const dashboardService = require('../services/dashboardService');

// GET /dashboard/stats
router.get('/stats', authenticate, async (req, res, next) => {
    try {
        const stats = await dashboardService.getStats();
        res.json(stats);
    } catch (err) {
        next(err);
    }
});

// GET /dashboard/insights  (also available at top-level /insights)
router.get('/insights', authenticate, async (req, res, next) => {
    try {
        const insights = await dashboardService.getInsights();
        res.json(insights);
    } catch (err) {
        next(err);
    }
});

// GET /dashboard/alerts
router.get('/alerts', authenticate, async (req, res, next) => {
    try {
        const alerts = await dashboardService.getAlerts();
        res.json(alerts);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
