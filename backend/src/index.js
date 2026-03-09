/**
 * OpsWatch Pro — Node.js + Express Backend
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');

const { errorHandler } = require('./middleware/errorHandler');
const ws = require('./websocket');

// ── Route imports ──────────────────────────────────────────
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const teamRoutes = require('./routes/teams');
const userRoutes = require('./routes/users');

const app = express();
const PORT = parseInt(process.env.PORT || '8000', 10);

// ── Middleware ──────────────────────────────────────────────
const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: origins.length === 1 && origins[0] === '*' ? '*' : origins,
    credentials: true,
}));
app.use(express.json());
app.use(morgan('combined'));

// ── Routes (matching spec endpoints exactly) ───────────────
// Spec-required routes:
//   POST /login          → authRoutes
//   GET  /tasks          → taskRoutes
//   POST /tasks          → taskRoutes
//   PUT  /tasks/:id      → taskRoutes
//   DELETE /tasks/:id    → taskRoutes
//   GET  /insights       → taskRoutes (top-level)

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', taskRoutes);                // mounts /tasks, /tasks/:id, /insights
app.use('/api/v1/dashboard', dashboardRoutes); // mounts /dashboard/stats, /dashboard/insights, /dashboard/alerts
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/users', userRoutes);

// ── Spec-required top-level aliases ────────────────────────
// The assignment spec requires exactly: POST /login, GET /tasks, etc.
// We mount auth at top-level /login as an alias for /api/v1/auth/login
app.use('/', authRoutes);                      // mounts POST /login at root level

// ── Health check ───────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'OpsWatch Pro API (Node.js)' });
});

// ── Error handler (must be last) ───────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────
const server = http.createServer(app);
ws.init(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[OpsWatch Pro] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[OpsWatch Pro] WebSocket ready on ws://0.0.0.0:${PORT}/ws`);
});

module.exports = app; // for testing
