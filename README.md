# TenderScope

TenderScope is a full-stack tender discovery and management application. It helps a team collect tender opportunities from external sources, store them in a central database, score and review them, and track applications from draft to submission.

The project is split into:

- `frontend/`: a Next.js application for authentication, dashboard, tender browsing, assistant features, and source management
- `backend/`: an Express API for tenders, applications, sources, AI helpers, and production-style scraping workflows
- `Supabase`: the database and authentication provider

## What The Application Does

TenderScope is built to support a tender workflow end to end:

1. A user adds or manages tender sources.
2. The system scrapes tender pages from those sources.
3. Scraped records are normalized and stored in Supabase.
4. Tenders are scored and enriched with extracted details.
5. Users review tenders in the dashboard.
6. Users create and track applications linked to tenders.

In practice, it gives a team one place to:

- collect opportunities from multiple tender websites
- review recent and high-priority tenders
- see tender scores and extracted metadata
- track application progress
- manage source health and scrape activity

## Main Features

### Tender Discovery

- scrape tender opportunities from configured sources
- follow relevant links from source pages
- deduplicate tenders by `title + source_url`
- store tender metadata such as deadline, budget, sector, and location

### Dashboard

- total tender counts
- new tender counts
- high-score tender summary
- application progress summary
- recent tender activity

### Tender Management

- list tenders with filters and sorting
- view tender details
- see linked scores and extracted details
- update tender status

### Application Tracking

- create applications from tenders
- track draft vs submitted applications
- view tender-linked applications

### Source Management

- add and remove sources
- enable or disable sources
- trigger scraping from the UI
- review recent scrape logs

### AI / Enrichment

- tender scoring helpers
- application assistance helpers
- company extraction helpers

## Tools And Technologies Used

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI / shadcn-style components
- Supabase SSR helpers

### Backend

- Node.js
- Express
- Supabase JavaScript client
- BullMQ
- Redis

### Scraping And Processing

- Cheerio
- Axios
- Puppeteer
- Playwright
- OpenAI SDK

### Database And Auth

- Supabase PostgreSQL
- Supabase Auth

## How It Works

### Frontend Flow

The Next.js frontend renders the UI and handles user-facing flows like:

- sign in / sign up
- dashboard viewing
- tender browsing
- assistant page access
- source management

Tender-related pages such as dashboard, tenders, and assistant now fetch data through the backend API so those requests are visible in browser dev tools.

### Backend Flow

The Express backend exposes API routes for:

- authentication helpers
- tenders
- applications
- tender sources
- AI helper endpoints
- scraping and scraping job orchestration

It also owns service-role database access for backend operations.

### Scraping Flow

There are currently two scraping paths in the repo:

1. `frontend/app/api/scrape/route.ts`
   This is the route the Sources UI currently calls when a user clicks `Scrape Now`.

2. `backend/routes/scrape-tenders.js`
   This is the backend production-style scraping route and queue entrypoint.

The frontend scrape route now:

- scrapes the source page
- finds candidate tender items
- deduplicates against existing tenders
- inserts using a Supabase admin client
- records insert errors instead of silently hiding them

## High-Level Architecture

```text
Browser
  |
  v
Frontend (Next.js)
  | \
  |  \-- Next API routes (/api/scrape, /api/ai/*)
  |
  v
Backend (Express API)
  |
  v
Supabase (Postgres + Auth)
```

For scraping, the architecture is currently mixed:

- some reads are performed through the backend API
- the Sources screen still triggers the frontend scrape route
- the backend also contains a more advanced scraping pipeline

## Repository Structure

```text
.
├── frontend/
│   ├── app/
│   │   ├── (dashboard)/              # Shared dashboard route-group files
│   │   ├── dashboard/                # Dashboard routes exposed in app router
│   │   ├── api/                      # Next.js API routes
│   │   ├── auth/                     # Auth routes
│   │   └── ...
│   ├── components/                   # UI and feature components
│   ├── hooks/                        # Client hooks
│   ├── lib/
│   │   ├── api/                      # Frontend API client
│   │   ├── auth/                     # Client auth helpers
│   │   ├── dashboard/                # Dashboard data helpers
│   │   ├── supabase/                 # Browser/server/admin Supabase helpers
│   │   └── types.ts                  # Shared frontend data types
│   ├── styles/
│   ├── .env.local
│   └── package.json
├── backend/
│   ├── routes/                       # Express route modules
│   ├── services/                     # Scraping and AI service layer
│   ├── jobs/                         # Worker/scheduler entrypoints
│   ├── queue/                        # Queue implementation
│   ├── scripts/                      # SQL setup, seed, cleanup, utilities
│   ├── utils/
│   ├── .env
│   ├── server.js
│   └── package.json
├── shared/
├── package.json                      # Monorepo convenience scripts
└── README.md
```

## Important Frontend Areas

- `frontend/app/dashboard/page.tsx`
  Server-side session gate for the dashboard route.

- `frontend/app/(dashboard)/dashboard-page-client.tsx`
  Client-side dashboard data fetching through backend APIs.

- `frontend/app/(dashboard)/tenders/tenders-page-client.tsx`
  Client-side tender list fetching.

- `frontend/app/(dashboard)/assistant/assistant-page-client.tsx`
  Client-side assistant data fetching.

- `frontend/app/api/scrape/route.ts`
  Current source-triggered scrape endpoint used by the UI.

## Important Backend Areas

- `backend/server.js`
  Express bootstrap and route mounting.

- `backend/routes/tenders.js`
  CRUD endpoints for tenders.

- `backend/routes/applications.js`
  CRUD endpoints for applications.

- `backend/routes/tender-sources.js`
  CRUD endpoints for tender sources.

- `backend/routes/scrape-tenders.js`
  Backend scraping and queue endpoints.

- `backend/services/pipeline.js`
  Service-role powered scrape processing pipeline.

## API Endpoints

### Backend API (`http://localhost:3001`)

Mounted in `backend/server.js`.

#### Auth

- `POST /api/auth/signin`
- `POST /api/auth/signup`
- `POST /api/auth/signout`
- `GET /api/auth/user`

#### Tenders

- `GET /api/tenders`
- `GET /api/tenders/:id`
- `POST /api/tenders`
- `PUT /api/tenders/:id`
- `DELETE /api/tenders/:id`

Notes:

- `GET /api/tenders` returns joined `tender_sources` and `tender_scores`
- current optional query params include `status` and `limit`

#### Applications

- `GET /api/applications`
- `POST /api/applications`
- `PUT /api/applications/:id`
- `DELETE /api/applications/:id`

#### Tender Sources

- `GET /api/tender-sources`
- `POST /api/tender-sources`
- `PUT /api/tender-sources/:id`
- `DELETE /api/tender-sources/:id`

#### AI

- `POST /api/ai/score-tender`
- `POST /api/ai/extract-company`
- `POST /api/ai/application-assist`

#### Email

- `POST /api/email/send-alert`

#### Scraping

- `POST /api/scrape-tenders`
- `POST /api/scrape-tenders/batch`
- `GET /api/scrape-tenders/status/:jobId`
- `GET /api/scrape-tenders/queue-stats`
- `GET /api/scrape-tenders/history`
- `POST /api/scrape-tenders/emergency`
- `POST /api/scrape-tenders/company`
- `GET /api/scrape-tenders/stats`
- `POST /api/scrape-tenders/cleanup`

#### Health

- `GET /health`

### Frontend Next API

Defined in `frontend/app/api`.

- `POST /api/scrape`
- `GET /api/scrape`
- `POST /api/ai/score-tender`
- `POST /api/ai/application-assist`
- `POST /api/ai/extract-company`

## Database Overview

The core tables created by `backend/scripts/001_create_tables.sql` are:

- `tender_sources`
- `tenders`
- `tender_scores`
- `extracted_details`
- `applications`
- `scrape_logs`
- `user_profiles` from `003_user_profiles.sql`

Important relationship examples:

- a `tender` belongs to a `tender_source`
- a `tender_score` belongs to a `tender`
- `extracted_details` belongs to a `tender`
- an `application` belongs to a `tender`
- a `scrape_log` belongs to a `tender_source`

## Local Setup

### Prerequisites

- Node.js 18+
- pnpm
- a Supabase project
- Redis if you want to run queue-based backend jobs
- OpenAI API key if you want AI-powered backend flows

### 1. Install Dependencies

From the repo root:

```bash
pnpm install
```

You can also install per app if needed:

```bash
cd frontend && pnpm install
cd ../backend && pnpm install
```

### 2. Configure Environment Variables

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is currently required by `frontend/app/api/scrape/route.ts`
- restart the frontend dev server after updating `.env.local`

#### Backend (`backend/.env`)

Typical local values:

```env
PORT=3001
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=...
EMAIL_HOST=...
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
```

### 3. Set Up The Database

Run these scripts against Supabase in order:

1. `backend/scripts/001_create_tables.sql`
2. `backend/scripts/002_seed_data.sql`
3. `backend/scripts/003_user_profiles.sql`

### 4. Start The Apps

From the repo root:

```bash
pnpm dev
pnpm backend:dev
```

Or manually:

```bash
cd frontend
pnpm dev
```

```bash
cd backend
pnpm dev
```

### 5. Open The Project

- frontend: `http://localhost:3000`
- backend: `http://localhost:3001`
- health check: `http://localhost:3001/health`

## Available Scripts

From the repo root:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm backend:dev
pnpm backend:start
pnpm backend:worker
pnpm backend:scheduler
```

## Common Routes

### Frontend

- `/landing`
- `/signin`
- `/signup`
- `/forgot-password`
- `/dashboard`
- `/dashboard/tenders`
- `/dashboard/tenders/[id]`
- `/dashboard/applications`
- `/dashboard/assistant`
- `/dashboard/sources`
- `/dashboard/settings`

### Backend

- `/health`
- `/api/tenders`
- `/api/applications`
- `/api/tender-sources`
- `/api/scrape-tenders`

## Current Notes And Caveats

- The project still contains both backend-based and frontend-based scraping paths.
- The Sources screen currently calls the frontend route at `/api/scrape`, not the backend `/api/scrape-tenders` endpoint.
- Some parts of the frontend still use direct Supabase access, while others have been moved to backend API fetches.
- There is an existing unrelated TypeScript issue in `frontend/components/auth/auth-form.tsx` around the sign-up response union type.

## Troubleshooting

### `{"error":"Route not found"}` from backend

Usually means the backend process is stale. Restart the backend dev server.

### Scrape finds tenders but inserts `0`

Check:

- `frontend/.env.local` includes `SUPABASE_SERVICE_ROLE_KEY`
- the frontend dev server was restarted after updating env values
- the `/api/scrape` response now includes any insert `errors`

### Frontend pages do not show backend requests in browser dev tools

Make sure you are testing routes already moved to API-driven client fetches:

- `/dashboard`
- `/dashboard/tenders`
- `/dashboard/assistant`

## Suggested Next Improvements

- consolidate all tender/application/source reads behind the backend API
- choose one scraping strategy to keep long term
- centralize Supabase admin operations in one service layer
- improve UI error reporting for scrape failures
- add tests for backend routes and scrape insert behavior
