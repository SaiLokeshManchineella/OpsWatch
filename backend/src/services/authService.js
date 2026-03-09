// ── Auth Service ──────────────────────────────────────────
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'dev-secret';
const ACCESS_EXPIRE_MIN = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '10080', 10);
const REFRESH_EXPIRE_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7', 10);

/**
 * Authenticate a user by username/password.
 * Returns the user row on success, throws HttpError on failure.
 */
async function authenticateUser(username, password) {
    const { rows } = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );

    if (rows.length === 0) {
        throw new HttpError(401, 'Incorrect username or password');
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.hashed_password);
    if (!valid) {
        throw new HttpError(401, 'Incorrect username or password');
    }

    if (!user.is_active) {
        throw new HttpError(401, 'Inactive user account');
    }

    return user;
}

/**
 * Register a new user.
 */
async function registerUser({ username, name, email, password }) {
    // Check existing username
    const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
        throw new HttpError(400, 'Username already registered');
    }

    // Check existing email
    const existingEmail = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
        throw new HttpError(400, 'Email already registered');
    }

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
        `INSERT INTO users (username, name, email, hashed_password, role)
     VALUES ($1, $2, $3, $4, 'member')
     RETURNING id, username, name, email, role, is_active, created_at, updated_at`,
        [username, name, email, hashed]
    );

    return rows[0];
}

/**
 * Generate access + refresh JWT tokens for a user.
 */
function generateTokens(userId) {
    const accessToken = jwt.sign(
        { sub: String(userId) },
        JWT_SECRET,
        { expiresIn: `${ACCESS_EXPIRE_MIN}m` }
    );

    const refreshToken = jwt.sign(
        { sub: String(userId), type: 'refresh' },
        JWT_SECRET,
        { expiresIn: `${REFRESH_EXPIRE_DAYS}d` }
    );

    return {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
    };
}

/**
 * Refresh an access token using a valid refresh token.
 */
async function refreshUserToken(refreshToken) {
    let payload;
    try {
        payload = jwt.verify(refreshToken, JWT_SECRET);
    } catch {
        throw new HttpError(401, 'Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
        throw new HttpError(401, 'Invalid refresh token');
    }

    const { rows } = await pool.query('SELECT id, is_active FROM users WHERE id = $1', [payload.sub]);
    if (rows.length === 0 || !rows[0].is_active) {
        throw new HttpError(401, 'User not found or inactive');
    }

    return generateTokens(rows[0].id);
}

module.exports = { authenticateUser, registerUser, generateTokens, refreshUserToken };
