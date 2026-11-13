# SPI Learning Management System (LMS)

SPI LMS is a learning platform for discovering courses and watching video lessons. It pairs a public course catalog with a dashboard for managing courses and lectures.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, React Icons, and React Fast Marquee
- **Backend:** Node.js and Express with TypeScript and an MVC-style structure
- **Database:** PostgreSQL, including support for Neon
- **Authentication:** Better Auth with email/password sessions, JWTs, and JWKS verification
- **Video:** YouTube, Vimeo, and direct video URLs

---

## 🚀 Run Locally

### Prerequisites

- Node.js 24 and npm
- A PostgreSQL database with TLS enabled, such as a Neon database
- Two terminal windows, one for the API and one for the frontend

Use an isolated development database. The commands below use PowerShell and start from the repository root.

### 1. Clone the repository

```powershell
git clone https://github.com/wasifhasancse/SPI-Learning-Management-System.git
cd SPI-Learning-Management-System
```

### 2. Install dependencies

```powershell
npm install --prefix backend
npm install --prefix frontend
```

### 3. Configure the environment

Copy the example files and replace the placeholders with your own values:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

**Backend — `backend/.env`**

```dotenv
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend — `frontend/.env.local`**

```dotenv
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
BETTER_AUTH_SECRET=<your-long-random-secret>
BETTER_AUTH_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
```

Set both database URLs to your development database. Generate a strong, unique `BETTER_AUTH_SECRET` and keep environment files out of version control. `CLIENT_URL` and `BETTER_AUTH_URL` should match the frontend origin. `SERVER_URL` is exposed to the browser, so it must be reachable by users and must not contain credentials; rebuild the frontend after changing it.

The database clients currently disable TLS certificate verification. Review the connection configuration before using this project outside an isolated development environment.

### 4. Initialize the database

From the repository root:

```powershell
npm run db:init --prefix backend
node frontend\src\scripts\initAuthDb.mjs
```

The first command creates the course and lecture tables if needed. The second applies Better Auth migrations and creates a default demo account if it does not already exist. That account uses hardcoded test credentials in the initialization script; use it only in an isolated development environment.

To add sample courses and lectures:

```powershell
npm run db:seed --prefix backend
```

> **Warning:** The seed command deletes all existing courses and lectures before inserting sample data. Do not run it against a database containing data you need.

### 5. Start the application

Start the backend from the repository root:

```powershell
npm run dev --prefix backend
```

In a second terminal, start the frontend:

```powershell
npm run dev --prefix frontend
```

- **Application:** [http://localhost:3000](http://localhost:3000)
- **Backend health endpoint:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Course management:** [http://localhost:3000/admin](http://localhost:3000/admin)

The health endpoint reports that the API is running; it does not independently verify database connectivity.

---

## ✨ Core Features

### Course discovery

- Browse course descriptions, prices, thumbnails, and lesson counts.
- Search by title or description, filter by price, and sort the catalog.
- Navigate results in pages of nine courses.
- Reuse recent catalog results for up to 15 seconds during client-side navigation. Course and lecture changes made in the same page session invalidate the cache.

### Video lessons

- Open a course to view its overview and ordered lesson list.
- Play YouTube, Vimeo, and direct MP4, WebM, or OGG videos.
- Choose when to start a lesson; videos do not automatically play.

### Course and lecture management

- Sign in to the dashboard and view catalog totals.
- Create, edit, and delete courses and lectures.
- Preview lesson videos and organize lessons by order.
- Switch between table and grid views for courses.

### Authentication and access

- Email/password sign-up and sign-in use Better Auth.
- The frontend requests JWTs for protected API operations; the Express API verifies them against the frontend's JWKS endpoint.
- Browsing courses and lessons does not require an account.

> **Important:** There is currently no role-based authorization. Any authenticated account can access the management dashboard and modify courses and lectures. Public sign-up is enabled, so this application should not be exposed as an admin-secured production system without additional access controls.

---

## 🧭 Project Structure

```text
backend/
  index.ts                   # Express entry point
  src/
    config/                  # PostgreSQL connection
    controllers/             # Request handlers
    middlewares/             # JWT verification
    models/                  # Database queries
    routes/                  # Course and lecture API routes
    scripts/                 # Database setup and integration scripts
  test/                      # Backend tests
frontend/
  src/
    app/                     # Pages and authentication routes
    components/              # Shared UI components
    lib/                     # API, authentication, and video helpers
    scripts/                 # Better Auth database initialization
  test/                      # Frontend API tests
```

---

## 🔌 API Overview

| Endpoint | Methods | Access |
| --- | --- | --- |
| `/api/health` | GET | Public |
| `/api/courses` | GET, POST | GET public; POST authenticated |
| `/api/courses/:id` | GET, PUT, DELETE | GET public; PUT and DELETE authenticated |
| `/api/courses/:courseId/lectures` | GET, POST | GET public; POST authenticated |
| `/api/lectures` | GET, POST | GET public; POST authenticated |
| `/api/lectures/:id` | GET, PUT, DELETE | GET public; PUT and DELETE authenticated |

Protected requests require a Bearer JWT issued by the frontend authentication service.

---

## 🧪 Testing and Builds

Run these commands from the repository root:

```powershell
# Frontend API tests
node --test frontend\test\api.test.mjs

# Backend build and tests
npm run build --prefix backend
node --test backend\test\app.test.cjs

# Production frontend build
npm run build --prefix frontend
```

The integration verification script can be run with `npm run test:e2e --prefix backend` while both services are running. It expects at least one course and the default demo account, and creates and deletes test records. Use an isolated development database; a failed run may leave test records behind.

---

## 🔎 Troubleshooting

- **Courses fail to load:** Check that the backend is running, `SERVER_URL` points to it, and `CLIENT_URL` matches the frontend origin.
- **Database setup fails:** Check the connection string, database availability, and TLS requirements.
- **Sign-in or token creation fails:** Verify the Better Auth tables, `BETTER_AUTH_URL`, and `BETTER_AUTH_SECRET`. Keep the secret stable when reusing an authentication database because JWT signing keys are encrypted with it.
- **Protected API requests fail:** Check that the frontend is reachable at `CLIENT_URL` and that `/api/auth/jwks` is available to the backend.
