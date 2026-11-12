# SPI Learning Management System (LMS)

A simplified, production-ready Learning Management System developed with **Next.js 16 (TypeScript)**, **Node.js/Express in TypeScript (MVC Architecture)**, **Neon PostgreSQL**, and **Better-Auth** with **JWT/Remote JWKS** security.

---

## Test Credentials for Evaluation

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@spilms.com` | `AdminPassword123!` | Full CRUD on Courses & Lectures |
| **Student** | *Public Access* | *No login needed* | Browse courses, view details & watch video lectures |

---

## Core Features

### 1. Student Panel
- **Course Catalog**: Dynamic course listing fetched directly from Neon PostgreSQL, displaying title, price, lecture count, and thumbnail.
- **Search & Filter**: Real-time course filtering by title or keywords.
- **Course Details & Lectures**: Dedicated curriculum overview displaying lessons and course summary.
- **Embedded Video Player**: Watch lectures through embedded video players (supports YouTube watch & embed URLs, Vimeo, and direct MP4/WebM files) with instant lesson switching.
- **Expanded Navigation**: Dedicated pages for Home, Courses, About, Contact, Sign In, and Sign Up with profile dropdown matching user specifications.

### 2. Admin Dashboard
- **Admin Authentication**: Secure sign-in powered by **Better-Auth** with JWT session tokens.
- **Course Management (CRUD)**:
  - Create courses (Title, Description, Price, Thumbnail URL).
  - Table and Grid layout toggle.
  - Edit existing courses with instant validation.
  - Delete courses (with confirmation modal and cascading deletion).
- **Lecture Management (CRUD)**:
  - Add lectures to specific courses (Title, Description, Video URL, Order sequencing).
  - Real-time video player preview inside the admin interface.
  - Edit and delete lectures.
- **Access Control**: All course and lecture modification routes are protected. The Express TypeScript backend verifies tokens via `jose-cjs` against the remote JWKS endpoint (`/api/auth/jwks`).

---

## Environment and Secret Contract

- **Zero Hardcoded Fallbacks**: All configuration uses `process.env.VARIABLE` directly without fallback literals (e.g., `secret: process.env.BETTER_AUTH_SECRET`, `baseURL: process.env.BETTER_AUTH_URL`). Hardcoded fallback strings for secrets, ports, or URLs are strictly prohibited.
- **Strict Folder Isolation**:
  - Frontend environment variables reside strictly in `frontend/.env.local`.
  - Backend environment variables reside strictly in `backend/.env`.
  - Root directory remains clean with no duplicate `.env` or unused build artifacts.

---

## Technology Stack

- **Frontend**: Next.js 16 (App Router, TypeScript)
- **Backend**: Node.js & Express.js in **TypeScript** following a clean **MVC** (Model-View-Controller) pattern in `backend/`
- **Database**: PostgreSQL hosted on **Neon DB**
- **Authentication**: **Better-Auth** with JWT plugin and JWKS
- **Backend JWT Verification**: `jose-cjs` with `createRemoteJWKSet(new URL(`${CLIENT_URL}/api/auth/jwks`))`
- **Styling**: Tailwind CSS with custom palette:
  - Primary Green: `#A8DF8E`
  - Soft Tint Background: `#F0FFDF`
  - Soft Pink: `#FFD8DF`
  - Vibrant Pink: `#FFAAB8`
  - Card Surface White: `#FFFFFF`
- **Typography**: Google Font **Montserrat**
- **Icons**: **React Icons** (`react-icons/hi2`)

---

## Project Structure

```
├── backend/                          # Express TypeScript MVC Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                 # Neon PostgreSQL connection pool
│   │   ├── controllers/
│   │   │   ├── courseController.ts   # Course CRUD logic
│   │   │   └── lectureController.ts  # Lecture CRUD logic
│   │   ├── middlewares/
│   │   │   └── authMiddleware.ts     # jose-cjs remote JWKS JWT verification
│   │   ├── models/
│   │   │   ├── courseModel.ts        # SQL queries for courses
│   │   │   └── lectureModel.ts       # SQL queries for lectures
│   │   ├── routes/
│   │   │   ├── courseRoutes.ts       # /api/courses
│   │   │   ├── directLectureRoutes.ts# /api/lectures/:id
│   │   │   └── lectureRoutes.ts      # /api/courses/:courseId/lectures
│   │   ├── scripts/
│   │   │   ├── initDb.ts             # Neon DB table initialization
│   │   │   ├── seed.ts               # Initial demo courses & lectures
│   │   │   ├── testIntegration.ts    # Model & database test verification
│   │   │   └── runE2E.ts             # Automated test runner
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces & types
│   │   └── app.ts                    # Express app and API routes
│   ├── index.ts                      # Local server and Vercel entrypoint
│   ├── .env                          # Backend environment variables
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                         # Next.js 16 TypeScript Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── about/                # About page
│   │   │   ├── admin/
│   │   │   │   ├── courses/          # Admin Course Management
│   │   │   │   │   └── [id]/lectures # Admin Lecture Management
│   │   │   │   └── login/            # Admin Sign-In Page
│   │   │   ├── api/auth/[...all]/    # Better-Auth & JWKS endpoints
│   │   │   ├── contact/              # Contact page
│   │   │   ├── courses/              # All Courses catalog & filter page
│   │   │   │   └── [id]/             # Student Video Player & Playlist
│   │   │   ├── login/                # Student/Admin Sign-In Page
│   │   │   ├── signup/               # Student/Admin Sign-Up Page
│   │   │   ├── globals.css           # Brand palette, container-custom, Montserrat font
│   │   │   ├── layout.tsx            # Global layout with responsive Navbar & Footer
│   │   │   └── page.tsx              # 11-section Home Page
│   │   ├── components/
│   │   │   ├── CourseCard.tsx        # Reusable course card
│   │   │   ├── Footer.tsx            # Standard footer
│   │   │   └── Navbar.tsx            # Navigation header with user dropdown
│   │   ├── lib/
│   │   │   ├── api.ts                # Frontend API client
│   │   │   ├── auth.ts               # Better-Auth server configuration
│   │   │   ├── auth-client.ts        # Better-Auth React client
│   │   │   └── videoHelper.ts        # YouTube / Vimeo embed parser
│   │   └── scripts/
│   │       └── initAuthDb.mjs        # Better-Auth schema migrations & admin seed
│   ├── .env.local                    # Frontend environment variables
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── AGENTS.md                         # Agent instructions & rules
├── design.md                         # UI/UX design tokens & palette contract
├── plan.md                           # Implementation milestones & checklist
└── README.md                         # Project documentation
```

---

## Getting Started

### 1. Environment Setup

Ensure environment variables are configured in their respective folders:

**`backend/.env`**:
```bash
DATABASE_URL
PORT
CLIENT_URL
NODE_ENV
```

**`frontend/.env.local`**:
```bash
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
SERVER_URL
```

The authentication client uses the current frontend origin. `BETTER_AUTH_URL` must match the public frontend origin, and the backend's `CLIENT_URL` must point to that same origin. `SERVER_URL` is exposed to the browser as the backend origin; set it to a public URL without credentials and rebuild the frontend after changing it.

Set the same stable `BETTER_AUTH_SECRET` for deployments that share an authentication database. The JWT signing keys are encrypted with this secret; changing it without rotating the signing key prevents the API from issuing tokens. Session retrieval does not automatically issue a JWT; the dashboard requests one from `/api/auth/token` when needed. If token creation fails, check the frontend's Vercel function logs and signing-key configuration.

The dedicated `/admin/login` page redirects to the dashboard after sign-in; the general sign-in page continues to the course catalog. The current authentication setup does not distinguish administrator roles: any authenticated account can access dashboard and CRUD endpoints. Restrict account creation and access appropriately until role-based authorization is implemented.

### 2. Database Initialization & Seeding

```bash
# Initialize Neon PostgreSQL course & lecture tables
npm run db:init --prefix backend

# Seed initial courses and lectures
npm run db:seed --prefix backend

# Initialize Better-Auth tables and seed default admin user
node frontend/src/scripts/initAuthDb.mjs
```

### 3. Start Backend Server (TypeScript)

```bash
cd backend
npm run dev
# Express TypeScript server runs on http://localhost:5000
```

To build for production:
```bash
cd backend
npm run build
npm start
```

### 4. Start Frontend Application

In a separate terminal:
```bash
cd frontend
npm run dev
# Next.js web application opens at http://localhost:3000
```

---

## Automated Testing and Verification

Run the full end-to-end integration test suite which boots both servers and tests all 6 phases:
```bash
cd backend
npx tsx src/scripts/runE2E.ts
```

This verifies:
1. Backend health check and Neon DB connectivity.
2. Dynamic course listing and lecture queries.
3. Better-Auth admin authentication and session issuance.
4. Remote JWKS endpoint and signature validation using `jose-cjs`.
5. Authenticated Admin CRUD operations (Create course, Add lecture, Update course, Delete lecture, Delete course).
6. Security guard validation (rejecting unauthenticated requests with HTTP 401).
