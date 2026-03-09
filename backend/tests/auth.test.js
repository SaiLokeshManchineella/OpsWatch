require('dotenv').config();
const request = require('supertest');
const pool = require('../src/config/db');

// Explicitly use IPv4
const app = 'http://127.0.0.1:8000';

describe('Authentication API (Running Server)', () => {

    // We'll generate a random username for the test run so we don't hit unique constraints
    const testUsername = `testuser_${Date.now()}`;
    const testPassword = 'SecurePassword123!';
    let testUserId;

    afterAll(async () => {
        // Cleanup the test user so the DB doesn't get cluttered
        if (testUserId) {
            await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
        }
        await pool.end();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should successfully register a new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    username: testUsername,
                    password: testPassword,
                    name: 'Automated Test User',
                    email: `${testUsername}@example.com`
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.username).toBe(testUsername);
            expect(res.body).not.toHaveProperty('password_hash'); // Ensure we don't leak hash

            testUserId = res.body.id;
        });

        it('should fail when registering an existing username', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    username: testUsername, // Sending the same one
                    password: testPassword,
                    name: 'Automated Test User 2',
                    email: `another_${testUsername}@example.com`
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('detail');
            expect(res.body.detail).toContain('Username already registered');
        });

        it('should fail when missing required fields', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    username: 'onlyusername'
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should successfully authenticate and return JWT tokens', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUsername,
                    password: testPassword
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('access_token');
            expect(res.body).toHaveProperty('refresh_token');
            expect(res.body.token_type).toBe('bearer');
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: testUsername,
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.detail).toBe('Incorrect username or password');
        });

        it('should fail with non-existent username', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    username: 'doesnotexist999888',
                    password: 'password'
                });

            expect(res.statusCode).toEqual(401);
        });
    });
});
