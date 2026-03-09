const request = require('supertest');
const pool = require('../src/config/db');

// Explicitly use IPv4 to avoid ::1 mapping issues
const app = 'http://127.0.0.1:8000';

describe('API Endpoints (Running Server)', () => {
    let token;

    beforeAll(async () => {
        // Attempt Login
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ username: 'admin', password: 'admin123' });

        token = res.body.access_token;
    });

    afterAll(async () => {
        await pool.end();
    });

    it('Health Check', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('ok');
    });

    it('GET /api/v1/tasks', async () => {
        const res = await request(app)
            .get('/api/v1/tasks')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('GET /api/v1/insights', async () => {
        const res = await request(app)
            .get('/api/v1/insights')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('total_tasks');
        expect(res.body).toHaveProperty('delayed_tasks');
        expect(Array.isArray(res.body.by_priority)).toBe(true);
        expect(Array.isArray(res.body.by_status)).toBe(true);
    });
});
