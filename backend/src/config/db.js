// ── Database connection pool (PostgreSQL) ─────────────────
const { Pool } = require('pg');

const pool = new Pool({
    // Replace 'localhost' with '127.0.0.1' to strictly enforce IPv4 resolving in Node 20
    connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace('localhost', '127.0.0.1') : undefined,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

module.exports = pool;
