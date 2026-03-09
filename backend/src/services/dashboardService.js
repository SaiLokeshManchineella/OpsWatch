// ── Dashboard Service ─────────────────────────────────────
const pool = require('../config/db');
const { detectDelays } = require('./taskService');

/**
 * GET /dashboard/stats
 * Returns: { total, in_progress, delayed, completed }
 */
async function getStats() {
  await detectDelays();

  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'In Progress')::int AS in_progress,
      COUNT(*) FILTER (WHERE status = 'Delayed')::int AS delayed,
      COUNT(*) FILTER (WHERE status = 'Completed')::int AS completed
    FROM tasks
  `);

  return rows[0];
}

/**
 * GET /insights
 * Returns: { total_tasks, delayed_tasks, completion_percentage, by_priority, by_status }
 */
async function getInsights() {
  await detectDelays();

  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'Completed')::int AS completed,
      COUNT(*) FILTER (WHERE status = 'Delayed')::int AS delayed,
      COUNT(*) FILTER (WHERE priority = 'High')::int AS high,
      COUNT(*) FILTER (WHERE priority = 'Medium')::int AS medium,
      COUNT(*) FILTER (WHERE priority = 'Low')::int AS low,
      COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'In Progress')::int AS in_progress
    FROM tasks
  `);

  // Team Distribution
  const { rows: teamRows } = await pool.query(`
      SELECT tm.name as label, COUNT(t.id)::int as value
      FROM tasks t
      JOIN teams tm ON t.team_id = tm.id
      GROUP BY tm.name
      ORDER BY value DESC
    `);

  // Calculate Average delay time for delayed tasks (in hours)
  const { rows: delayRows } = await pool.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (NOW() - expected_completion_time))/3600)::int as avg_delay_hours
      FROM tasks
      WHERE status = 'Delayed'
    `);

  const r = rows[0];
  const completionPct = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;
  const avgDelayHours = delayRows[0]?.avg_delay_hours || 0;

  // Generate strict colors for teams based on index
  const teamColors = ['#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#3B82F6'];
  const by_team = teamRows.map((tr, i) => ({
    label: tr.label,
    value: tr.value,
    color: teamColors[i % teamColors.length]
  }));

  return {
    total_tasks: r.total,
    delayed_tasks: r.delayed,
    completion_percentage: completionPct,
    avg_delay_hours: avgDelayHours,
    by_priority: [
      { label: 'High', value: r.high, color: '#EF4444' },
      { label: 'Medium', value: r.medium, color: '#F59E0B' },
      { label: 'Low', value: r.low, color: '#9CA3AF' },
    ],
    by_status: [
      { label: 'Pending', value: r.pending, color: '#F59E0B' },
      { label: 'In Progress', value: r.in_progress, color: '#0D9488' },
      { label: 'Completed', value: r.completed, color: '#10B981' },
      { label: 'Delayed', value: r.delayed, color: '#EF4444' },
    ],
    by_team: by_team
  };
}

/**
 * GET /dashboard/alerts
 * Returns tasks where priority = 'High' AND status = 'Delayed'
 */
async function getAlerts() {
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
    WHERE t.status = 'Delayed' AND t.priority = 'High'
    ORDER BY t.expected_completion_time ASC
  `);

  return rows;
}

module.exports = { getStats, getInsights, getAlerts };
