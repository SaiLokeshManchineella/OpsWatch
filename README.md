# OpsWatch Pro — Operations Intelligence Dashboard

A full-stack **Operations Intelligence Dashboard** that enables teams to monitor workflows, detect delays automatically, and trigger real-time operational alerts. Built with **React**, **Node.js/Express**, and **PostgreSQL**.

> **Live Demo**: [http://your-ec2-ip](http://your-ec2-ip)  
> **Backend API**: [http://your-ec2-ip:8000](http://your-ec2-ip:8000)  
> **GitHub**: [https://github.com/SaiLokeshManchineella/opswatch-pro](https://github.com/SaiLokeshManchineella/opswatch-pro)

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 18 + TypeScript + Vite                                │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────────┐  │
│  │  Login   │ │  Dashboard   │ │   Task Workflow Manager   │  │
│  │  Page    │ │  (Stats,     │ │   (CRUD, Filters,        │  │
│  │          │ │   Alerts,    │ │    Pagination)            │  │
│  │          │ │   Top 5      │ │                          │  │
│  │          │ │   Delayed,   │ │                          │  │
│  │          │ │   Insights)  │ │                          │  │
│  └──────────┘ └──────────────┘ └──────────────────────────┘  │
│                      │  Axios + WebSocket                    │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  Node.js + Express                                           │
│  ┌────────────┐ ┌────────────┐ ┌─────────────────────────┐   │
│  │  Auth      │ │  Tasks     │ │  Dashboard / Insights   │   │
│  │  (JWT)     │ │  (CRUD +   │ │  (Stats, Alerts,        │   │
│  │            │ │   Delay    │ │   Grouping by           │   │
│  │            │ │   Detection│ │   Priority & Status)    │   │
│  └────────────┘ └────────────┘ └─────────────────────────┘   │
│                      │  WebSocket broadcast on changes       │
│                      │  Morgan HTTP logging                  │
│                      │  Activity logs table                  │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                     POSTGRESQL                               │
│  (Supabase-hosted)                                           │
│  Tables: users, teams, tasks, activity_logs                  │
│  Auto-update triggers, performance indexes                   │
└──────────────────────────────────────────────────────────────┘
```

### Frontend Stack
- **React 18** with **TypeScript** and **Vite** for fast dev/build
- **Tailwind CSS** + **shadcn/ui** + **Lucide** icons for polished UI
- **React Context** (`AuthContext`, `TaskContext`) for state management
- **Axios** with JWT interceptors for API communication
- **WebSocket** client for real-time task updates
- **Recharts** for analytics visualizations

### Backend Stack
- **Node.js 20+** with **Express.js**
- **PostgreSQL** via `pg` (connection pooling)
- **JWT** authentication (access + refresh tokens) with **bcryptjs** password hashing
- **WebSocket** server (`ws`) for real-time broadcasting
- **Morgan** HTTP request logging
- Service-layer architecture: `routes/` → `services/` → `config/db`

### Key Logic

1. **Automated Delay Detection**: The backend runs a SQL UPDATE on every read operation — if `expected_completion_time < NOW()` and status is not already `Completed` or `Delayed`, the task is automatically marked as `Delayed`. The frontend also runs periodic (60s) delay detection for instant UI feedback.

2. **Operational Alerts**: When a task has `priority = 'High'` AND `status = 'Delayed'`, it appears in the Alerts panel on the dashboard with the message: *"High priority task is delayed"*.

3. **Insights Engine**: The `GET /insights` endpoint returns `total_tasks`, `delayed_tasks`, `completion_percentage`, tasks grouped by priority, and tasks grouped by status — all computed in a single SQL query.

4. **Real-time Updates**: Task CRUD operations broadcast WebSocket events. All connected clients re-fetch data automatically when receiving `task_created`, `task_updated`, or `task_deleted` events.

---

## 📁 Project Structure

```
opswatch-pro/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/db.js        # PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT authentication middleware
│   │   │   └── errorHandler.js # Centralized error handling
│   │   ├── routes/
│   │   │   ├── auth.js         # POST /login, /register, /refresh
│   │   │   ├── tasks.js        # CRUD + GET /insights
│   │   │   ├── dashboard.js    # /stats, /insights, /alerts
│   │   │   ├── teams.js        # GET /teams
│   │   │   └── users.js        # GET/PUT /users/me
│   │   ├── services/
│   │   │   ├── authService.js  # Auth logic (bcrypt, JWT)
│   │   │   ├── taskService.js  # Task CRUD + delay detection
│   │   │   └── dashboardService.js # Stats, insights, alerts
│   │   ├── websocket/index.js  # WebSocket server
│   │   └── index.js            # Express app entry point
│   ├── tests/                  # Jest unit tests
│   ├── Dockerfile              # Backend Docker image
│   ├── .env.example            # Environment template
│   └── package.json
├── src/                        # React frontend
│   ├── components/
│   │   ├── dashboard/          # StatCard, AlertsPanel, DelayedTasksTable, InsightsPanel
│   │   ├── tasks/              # TaskTable, TaskSlideOver, TaskFilters
│   │   ├── layout/             # Sidebar, Header, Layout
│   │   ├── common/             # Modals, dialogs
│   │   └── ui/                 # shadcn/ui primitives
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state + JWT management
│   │   └── TaskContext.tsx      # Tasks state + WebSocket subscription
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TaskManagerPage.tsx
│   │   └── AnalyticsPage.tsx
│   ├── lib/
│   │   ├── api.ts              # Axios instance with interceptors
│   │   └── api-client.ts       # API client functions
│   └── utils/
│       └── delayDetection.ts   # Client-side delay detection
├── database_schema.sql          # Full PostgreSQL schema (tables, indexes, triggers, seeds)
├── docker-compose.yml           # Production compose (backend + frontend)
├── Dockerfile                   # Frontend multi-stage build (Vite → Nginx)
├── nginx.conf                   # Nginx config for SPA serving
├── .env.example                 # Frontend env template
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v20+
- **Git**
- **Docker** + **Docker Compose** (for containerized deployment)
- A **PostgreSQL** database (we recommend [Supabase](https://supabase.com) for free hosted Postgres)

### Step 1: Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com) (or use any PostgreSQL instance).
2. Go to the **SQL Editor** and run the entire contents of `database_schema.sql` to create all tables, indexes, triggers, and seed data.
3. Copy the **database connection string** from Supabase → Settings → Database → Connection String (URI).

### Step 2: Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET_KEY

npm install
npm run dev
# Backend runs on http://localhost:8000
```

### Step 3: Frontend Setup

```bash
# From the project root
cp .env.example .env
# Verify: VITE_API_URL=http://localhost:8000/api/v1

npm install
npm run dev
# Frontend runs on http://localhost:5173 (or 8080)
```

### Step 4: Login

Navigate to `http://localhost:5173` and use the demo credentials:
- **Username**: `admin`
- **Password**: `admin123`

> **Note**: You'll need to register this user first via the Register page, or insert one into the database using the SQL Editor.

---

## 🐳 Docker Deployment (Local / EC2)

### Quick Start

```bash
# 1. Configure environment
cp .env.example .env
# Edit: VITE_API_URL=http://<YOUR_EC2_PUBLIC_IP>:8000/api/v1

# 2. Configure backend environment
cp backend/.env.example backend/.env
# Edit: DATABASE_URL, JWT_SECRET_KEY, CORS_ORIGINS

# 3. Build and run
docker-compose up --build -d
```

This starts:
- **Frontend** on port **80** (Nginx serving built React app)
- **Backend** on port **8000** (Node.js Express API)

---

## ☁️ EC2 Deployment Guide

### 1. Launch an EC2 Instance

- **AMI**: Ubuntu 22.04 LTS (or Amazon Linux 2023)
- **Instance type**: `t2.small` or `t3.small` (minimum `t2.micro` for free tier)
- **Security Group** — open the following inbound ports:
  - **22** (SSH)
  - **80** (HTTP — frontend)
  - **8000** (Backend API)

### 2. SSH into the Instance

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### 3. Install Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
exit
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### 4. Clone and Configure

```bash
git clone https://github.com/SaiLokeshManchineella/opswatch-pro.git
cd opswatch-pro

# Frontend env
cp .env.example .env
# Edit: VITE_API_URL=http://<EC2_PUBLIC_IP>:8000/api/v1
nano .env

# Backend env
cp backend/.env.example backend/.env
# Edit: DATABASE_URL, JWT_SECRET_KEY, CORS_ORIGINS (add http://<EC2_PUBLIC_IP>)
nano backend/.env
```

### 5. Build and Deploy

```bash
# Export VITE_API_URL for docker-compose build args
export VITE_API_URL=http://<EC2_PUBLIC_IP>:8000/api/v1

docker-compose up --build -d
```

### 6. Verify

- **Frontend**: `http://<EC2_PUBLIC_IP>`
- **Backend Health**: `http://<EC2_PUBLIC_IP>:8000/`
- **API**: `http://<EC2_PUBLIC_IP>:8000/api/v1/insights`

### Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Rebuild after code changes
git pull
docker-compose up --build -d
```

---

## 📚 API Documentation

**Base URL**: `http://localhost:8000/api/v1`  
**Auth**: All endpoints (except login/register) require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/auth/login` | Authenticate user, returns JWT tokens | `{ "username", "password" }` |
| `POST` | `/auth/register` | Create a new user account | `{ "username", "name", "email", "password" }` |
| `POST` | `/auth/refresh` | Refresh access token | `{ "refresh_token" }` |
| `POST` | `/login` | Alias for `/auth/login` (spec-compliant) | `{ "username", "password" }` |

**Response** (login/refresh):
```json
{
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "token_type": "bearer"
}
```

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks` | List tasks (paginated). Query params: `status`, `priority`, `team_id`, `search`, `skip`, `limit` |
| `POST` | `/tasks` | Create a new task |
| `GET` | `/tasks/:id` | Get a single task by ID |
| `PUT` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task |

**Create Task Body**:
```json
{
  "title": "Deploy v2.0",
  "description": "Deploy the latest version to production",
  "team_id": "uuid-of-team",
  "priority": "High",
  "status": "Pending",
  "expected_completion_time": "2026-03-10T18:00:00Z"
}
```

**Paginated Response**:
```json
{
  "items": [ ... ],
  "total": 42,
  "page": 1,
  "size": 10
}
```

### Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/insights` | Operational insights (spec-required endpoint) |

**Response**:
```json
{
  "total_tasks": 42,
  "delayed_tasks": 5,
  "completion_percentage": 60,
  "avg_delay_hours": 12,
  "by_priority": [
    { "label": "High", "value": 10 },
    { "label": "Medium", "value": 20 },
    { "label": "Low", "value": 12 }
  ],
  "by_status": [
    { "label": "Pending", "value": 8 },
    { "label": "In Progress", "value": 9 },
    { "label": "Completed", "value": 20 },
    { "label": "Delayed", "value": 5 }
  ]
}
```

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/stats` | `{ total, in_progress, delayed, completed }` |
| `GET` | `/dashboard/insights` | Same as `/insights` |
| `GET` | `/dashboard/alerts` | High-priority delayed tasks (operational alerts) |

### Teams & Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/teams` | List all teams |
| `GET` | `/users/me` | Current user profile |
| `PUT` | `/users/me` | Update current user profile |

---

## 🗄 Database Schema

Uses **PostgreSQL** with the following tables:

### `tasks`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `title` | VARCHAR(255) | Task title |
| `description` | TEXT | Task description |
| `team_id` | UUID (FK → teams) | Assigned team |
| `priority` | VARCHAR(10) | `High`, `Medium`, `Low` |
| `status` | VARCHAR(20) | `Pending`, `In Progress`, `Completed`, `Delayed` |
| `expected_completion_time` | TIMESTAMPTZ | Deadline for delay detection |
| `created_by` | UUID (FK → users) | Creator |
| `assigned_to` | UUID (FK → users) | Assignee (nullable) |
| `created_at` | TIMESTAMPTZ | Auto-set |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

### `users`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `username` | VARCHAR(50) | Unique |
| `name` | VARCHAR(100) | Display name |
| `email` | VARCHAR(255) | Unique |
| `hashed_password` | TEXT | bcrypt hash |
| `role` | VARCHAR(20) | `admin`, `manager`, `member` |
| `is_active` | BOOLEAN | Account status |

### `teams`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `name` | VARCHAR(100) | Unique team name |

### `activity_logs`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `task_id` | UUID (FK → tasks) | Related task |
| `user_id` | UUID (FK → users) | Actor |
| `action` | VARCHAR(50) | `created`, `updated`, `status_changed` |
| `old_value` | JSONB | Previous state |
| `new_value` | JSONB | New state |

---

## 🧪 Testing

### Backend Tests (Jest)

```bash
cd backend
npm test
```

Test files:
- `tests/app.test.js` — Server health checks
- `tests/auth.test.js` — Authentication flow tests
- `tests/tasks.test.js` — Task CRUD tests
- `tests/dashboard.test.js` — Dashboard/insights tests
- `tests/services.test.js` — Service layer unit tests

### Frontend Tests (Vitest)

```bash
# From project root
npm test
```

---

## ✨ Features Summary

### Core Requirements
- ✅ Login page with JWT authentication
- ✅ Operations Dashboard (total, in-progress, delayed, completed counts)
- ✅ Top 5 delayed tasks displayed on dashboard
- ✅ Task Workflow Manager (create/edit/delete with all required fields)
- ✅ Automatic delay detection (backend + frontend)
- ✅ Operational alerts for high-priority delayed tasks
- ✅ `GET /insights` endpoint with grouping by priority and status

### Bonus Features
- ✅ **JWT Authentication** — Access + refresh tokens with bcrypt password hashing
- ✅ **WebSocket Live Updates** — Real-time task change broadcasting
- ✅ **Docker Setup** — Multi-stage Dockerfiles + docker-compose for production
- ✅ **Logging System** — Morgan HTTP logging + activity_logs database table
- ✅ **Clean Architecture** — Service layer pattern (routes → services → database)
- ✅ **Pagination** — Server-side pagination with skip/limit
- ✅ **Unit Tests** — Backend (Jest) + Frontend (Vitest) test suites
