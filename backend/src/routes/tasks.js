// ── Task Routes ───────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const taskService = require('../services/taskService');
const dashboardService = require('../services/dashboardService');

// GET /insights  (spec-required top-level endpoint)
router.get('/insights', authenticate, async (req, res, next) => {
    try {
        const insights = await dashboardService.getInsights();
        res.json(insights);
    } catch (err) {
        next(err);
    }
});

// GET /tasks
router.get('/tasks', authenticate, async (req, res, next) => {
    try {
        const { status, priority, team_id, search, skip, limit } = req.query;
        const result = await taskService.getTasks({
            status,
            priority,
            team_id,
            search,
            skip: parseInt(skip || '0', 10),
            limit: parseInt(limit || '50', 10),
        });
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// POST /tasks
router.post('/tasks', authenticate, async (req, res, next) => {
    try {
        if (!req.body.title || typeof req.body.title !== 'string' || req.body.title.trim() === '') {
            return res.status(400).json({ detail: "Title is required" });
        }

        const task = await taskService.createTask(req.body, req.user.id);
        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
});

// GET /tasks/:id
router.get('/tasks/:id', authenticate, async (req, res, next) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        res.json(task);
    } catch (err) {
        next(err);
    }
});

// PUT /tasks/:id  (spec requires PUT, not PATCH)
router.put('/tasks/:id', authenticate, async (req, res, next) => {
    try {
        const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
        res.json(task);
    } catch (err) {
        next(err);
    }
});

// DELETE /tasks/:id
router.delete('/tasks/:id', authenticate, async (req, res, next) => {
    try {
        await taskService.deleteTask(req.params.id);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
