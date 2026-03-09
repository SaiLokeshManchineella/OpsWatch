-- ============================================================
-- OpsWatch Pro — Supabase Database Schema
-- ============================================================
-- Run this entire file in the Supabase SQL Editor (single execution).
-- It creates all tables, indexes, triggers, and seed data.
-- ============================================================

-- ── 1. Enable required extensions ──────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. Teams table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. Users table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'member'
                        CHECK (role IN ('admin', 'manager', 'member')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. Tasks table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                    VARCHAR(255) NOT NULL,
    description              TEXT NOT NULL,
    team_id                  UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    priority                 VARCHAR(10) NOT NULL DEFAULT 'Medium'
                                CHECK (priority IN ('High', 'Medium', 'Low')),
    status                   VARCHAR(20) NOT NULL DEFAULT 'Pending'
                                CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Delayed')),
    expected_completion_time TIMESTAMPTZ NOT NULL,
    created_by               UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. Activity logs table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action      VARCHAR(50) NOT NULL,
    old_value   JSONB,
    new_value   JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 6. Indexes for performance ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_expected_completion ON tasks(expected_completion_time);
CREATE INDEX IF NOT EXISTS idx_activity_logs_task_id ON activity_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ── 7. Auto-update `updated_at` trigger ────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 8. Seed teams ──────────────────────────────────────────
INSERT INTO teams (name) VALUES
    ('Engineering'),
    ('Sales'),
    ('Design'),
    ('Operations'),
    ('Support')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Done! All tables, indexes, triggers, and seed data created.
-- ============================================================
