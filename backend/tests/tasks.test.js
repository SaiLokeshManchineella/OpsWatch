require('dotenv').config();
const request = require('supertest');
const pool = require('../src/config/db');

const app = 'http://127.0.0.1:8000';

describe('Tasks API (Running Server)', () => {
    let token;
    let testTeamId;
    let testTaskId;

    beforeAll(async () => {
        // Login as admin
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ username: 'admin', password: 'admin123' });
        token = res.body.access_token;

        // Fetch teams to get a valid team ID
        const teamsRes = await request(app)
            .get('/api/v1/teams')
            .set('Authorization', `Bearer ${token}`);

        testTeamId = teamsRes.body[0].id;
    });

    afterAll(async () => {
        if (testTaskId) {
            await pool.query('DELETE FROM tasks WHERE id = $1', [testTaskId]);
        }
        await pool.end();
    });

    describe('POST /api/v1/tasks', () => {
        it('should create a new task', async () => {
            const res = await request(app)
                .post('/api/v1/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Automated API Test Task',
                    description: 'Testing task creation',
                    team_id: testTeamId,
                    priority: 'Medium',
                    status: 'Pending',
                    expected_completion_time: new Date(Date.now() + 86400000).toISOString() // Tomorrow
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.title).toBe('Automated API Test Task');

            testTaskId = res.body.id;
        });

        it('should fail with missing title', async () => {
            const res = await request(app)
                .post('/api/v1/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    description: 'No title provided',
                    team_id: testTeamId
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/v1/tasks', () => {
        it('should fetch tasks with pagination and default formatting', async () => {
            const res = await request(app)
                .get('/api/v1/tasks?limit=5')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('items');
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(Array.isArray(res.body.items)).toBe(true);
            expect(res.body.items.length).toBeLessThanOrEqual(5);
        });

        it('should filter tasks by status correctly', async () => {
            const res = await request(app)
                .get('/api/v1/tasks?status=Pending')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            if (res.body.items.length > 0) {
                expect(res.body.items[0].status).toBe('Pending');
            }
        });
    });

    describe('PUT /api/v1/tasks/:id', () => {
        it('should update an existing task', async () => {
            const res = await request(app)
                .put(`/api/v1/tasks/${testTaskId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    status: 'In Progress'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('In Progress');
        });

        it('should return 404 for updating non-existent task', async () => {
            const res = await request(app)
                .put('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'Completed' });

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /api/v1/tasks/:id', () => {
        it('should delete the task', async () => {
            const res = await request(app)
                .delete(`/api/v1/tasks/${testTaskId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(204);

            // Verify it is gone
            const check = await pool.query('SELECT id FROM tasks WHERE id = $1', [testTaskId]);
            expect(check.rows.length).toBe(0);

            testTaskId = null; // Prevent afterAll cleanup failure
        });
    });
});
