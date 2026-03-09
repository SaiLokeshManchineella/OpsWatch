require('dotenv').config();
const request = require('supertest');
const { detectDelays } = require('../src/services/taskService');
const pool = require('../src/config/db');

describe('Standalone Services (Unit tests)', () => {

    // We isolate the delay logic by seeding a mock task that is historically doomed to be delayed
    let mockTaskId;

    afterAll(async () => {
        if (mockTaskId) {
            await pool.query('DELETE FROM tasks WHERE id = $1', [mockTaskId]);
        }
        await pool.end();
    });

    it('detectDelays should successfully run without throwing', async () => {
        // Just verify the SQL executes safely
        await expect(detectDelays()).resolves.not.toThrow();
    });

    it('detectDelays should automatically mark expired pending tasks as Delayed', async () => {
        // 1. Manually insert a task with a completion time in the past
        const res = await pool.query(`
            INSERT INTO tasks (title, description, team_id, priority, status, expected_completion_time, created_by)
            VALUES ($1, $2, (SELECT id FROM teams LIMIT 1), $3, $4, NOW() - INTERVAL '1 day', (SELECT id FROM users LIMIT 1))
            RETURNING id
        `, ['Expired Test Task', 'Should be caught by detectDelays', 'Medium', 'Pending']);


        mockTaskId = res.rows[0].id;

        // 2. Run the background job
        await detectDelays();

        // 3. Verify the status was forcefully changed to 'Delayed'
        const check = await pool.query('SELECT status FROM tasks WHERE id = $1', [mockTaskId]);
        expect(check.rows[0].status).toBe('Delayed');
    });
});
