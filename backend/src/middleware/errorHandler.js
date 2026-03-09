// ── Centralized Error Handler ─────────────────────────────

const errorHandler = (err, req, res, _next) => {
    console.error('[ERROR]', err.message);

    // Known HTTP error (thrown by services)
    if (err.statusCode) {
        return res.status(err.statusCode).json({ detail: err.message });
    }

    // Postgres unique violation
    if (err.code === '23505') {
        return res.status(400).json({ detail: 'A record with this value already exists' });
    }

    // Postgres foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({ detail: 'Referenced record does not exist' });
    }

    res.status(500).json({ detail: 'Internal server error' });
};

/**
 * Helper to create throwable HTTP errors
 */
class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = { errorHandler, HttpError };
