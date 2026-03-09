const request = require('supertest');
const pool = require('../src/config/db');

const app = 'http://127.0.0.1:8000';

describe('Dashboard & Insights API (Running Server)', () => {
    let token;

    beforeAll(async () => {
        // Login as admin to get token
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ username: 'admin', password: 'admin123' });
        token = res.body.access_token;
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('GET /api/v1/dashboard/stats', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/v1/dashboard/stats');
            expect(res.statusCode).toEqual(401);
        });

        it('should return aggregated high-level stats', async () => {
            const res = await request(app)
                .get('/api/v1/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('in_progress');
            expect(res.body).toHaveProperty('delayed');
            expect(res.body).toHaveProperty('completed');

            // Stats should be numbers
            expect(typeof res.body.total).toBe('number');
        });
    });

    describe('GET /api/v1/dashboard/insights', () => {
        it('should return complex insights payload', async () => {
            const res = await request(app)
                .get('/api/v1/dashboard/insights')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total_tasks');
            expect(res.body).toHaveProperty('completion_percentage');
            expect(res.body).toHaveProperty('avg_delay_hours');

            // Check arrays
            expect(Array.isArray(res.body.by_priority)).toBe(true);
            expect(Array.isArray(res.body.by_status)).toBe(true);
            expect(Array.isArray(res.body.by_team)).toBe(true);

            if (res.body.by_priority.length > 0) {
                expect(res.body.by_priority[0]).toHaveProperty('label');
                expect(res.body.by_priority[0]).toHaveProperty('value');
            }
        });
    });

    describe('GET /api/v1/dashboard/alerts', () => {
        it('should return array of High priority Delayed tasks', async () => {
            const res = await request(app)
                .get('/api/v1/dashboard/alerts')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);

            // If there are alerts, ensure they are actually High/Delayed
            if (res.body.length > 0) {
                const firstAlert = res.body[0];
                expect(firstAlert.priority).toBe('High');
                expect(firstAlert.status).toBe('Delayed');
            }
        });
    });
});
