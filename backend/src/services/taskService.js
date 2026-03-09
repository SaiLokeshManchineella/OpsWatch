// ── Task Service ──────────────────────────────────────────
const pool = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');
const ws = require('../websocket');

/**
 * Run delay detection — marks overdue non-completed tasks as 'Delayed'.
 */
async function detectDelays() {
    const { rows } = await pool.query(`
    UPDATE tasks
    SET status = 'Delayed', updated_at = NOW()
    WHERE expected_completion_time < NOW()
      AND status NOT IN ('Completed', 'Delayed')
    RETURNING id
  `);

    for (const row of rows) {
        ws.broadcast({ event: 'task_updated', task_id: row.id });
    }
}

/**
 * Get paginated list of tasks with optional filters.
 */
async function getTasks({ status, priority, team_id, search, skip = 0, limit = 50 }) {
    await detectDelays();

    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) { conditions.push(`t.status = $${idx++}`); params.push(status); }
    if (priority) { conditions.push(`t.priority = $${idx++}`); params.push(priority); }
    if (team_id) { conditions.push(`t.team_id = $${idx++}`); params.push(team_id); }
    if (search) {
        conditions.push(`(t.title ILIKE $${idx} OR t.description ILIKE $${idx})`);
        params.push(`%${search}%`);
        idx++;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Count
    const countResult = await pool.query(`SELECT COUNT(*) FROM tasks t ${where}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Fetch rows
    const dataParams = [...params, limit, skip];
    const { rows } = await pool.query(`
    SELECT t.*,
           json_build_object('id', tm.id, 'name', tm.name) AS team,
           json_build_object('id', cu.id, 'username', cu.username, 'name', cu.name) AS creator,
           CASE WHEN au.id IS NOT NULL
                THEN json_build_object('id', au.id, 'username', au.username, 'name', au.name)
                ELSE NULL END AS assignee
    FROM tasks t
    LEFT JOIN teams tm ON tm.id = t.team_id
    LEFT JOIN users cu ON cu.id = t.created_by
    LEFT JOIN users au ON au.id = t.assigned_to
    ${where}
    ORDER BY t.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `, dataParams);

    return {
        items: rows,
        total,
        page: Math.floor(skip / limit) + 1,
        size: limit,
    };
}

/**
 * Get a single task by ID with joined team/creator/assignee.
 */
async function getTaskById(id) {
    await detectDelays();

    const { rows } = await pool.query(`
    SELECT t.*,
           json_build_object('id', tm.id, 'name', tm.name) AS team,
           json_build_object('id', cu.id, 'username', cu.username, 'name', cu.name) AS creator,
           CASE WHEN au.id IS NOT NULL
                THEN json_build_object('id', au.id, 'username', au.username, 'name', au.name)
                ELSE NULL END AS assignee
    FROM tasks t
    LEFT JOIN teams tm ON tm.id = t.team_id
    LEFT JOIN users cu ON cu.id = t.created_by
    LEFT JOIN users au ON au.id = t.assigned_to
    WHERE t.id = $1
  `, [id]);

    if (rows.length === 0) {
        throw new HttpError(404, 'Task not found');
    }

    return rows[0];
}

/**
 * Create a new task.
 */
async function createTask(data, userId) {
    const { title, description, team_id, priority, status, expected_completion_time, assigned_to } = data;

    const { rows } = await pool.query(`
    INSERT INTO tasks (title, description, team_id, priority, status, expected_completion_time, created_by, assigned_to)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [title, description, team_id, priority || 'Medium', status || 'Pending', expected_completion_time, userId, assigned_to || null]);

    const task = rows[0];

    // Log creation
    await pool.query(`
    INSERT INTO activity_logs (task_id, user_id, action, new_value)
    VALUES ($1, $2, 'created', $3)
  `, [task.id, userId, JSON.stringify({ status: task.status, priority: task.priority })]);

    ws.broadcast({ event: 'task_created', task_id: task.id });

    return task;
}

/**
 * Update an existing task (PUT semantics — partial update allowed).
 */
async function updateTask(id, data, userId) {
    // Verify task exists
    const existing = await getTaskById(id);

    const fields = [];
    const params = [];
    let idx = 1;

    const allowedFields = ['title', 'description', 'team_id', 'priority', 'status', 'expected_completion_time', 'assigned_to'];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            fields.push(`${field} = $${idx++}`);
            params.push(data[field]);
        }
    }

    if (fields.length === 0) {
        return existing;
    }

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const { rows } = await pool.query(
        `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        params
    );

    const oldState = { status: existing.status, priority: existing.priority };
    const newState = { status: rows[0].status, priority: rows[0].priority };
    const action = oldState.status !== newState.status ? 'status_changed' : 'updated';

    await pool.query(`
    INSERT INTO activity_logs (task_id, user_id, action, old_value, new_value)
    VALUES ($1, $2, $3, $4, $5)
  `, [id, userId, action, JSON.stringify(oldState), JSON.stringify(newState)]);

    ws.broadcast({ event: 'task_updated', task_id: id });

    return await getTaskById(id);
}

/**
 * Delete a task.
 */
async function deleteTask(id) {
    const task = await getTaskById(id);
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    ws.broadcast({ event: 'task_deleted', task_id: id });
}

module.exports = { detectDelays, getTasks, getTaskById, createTask, updateTask, deleteTask };
