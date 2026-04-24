# TenderScope

TenderScope is a tender discovery and management platform with:

- a `frontend/` Next.js app for authentication, dashboard, tender browsing, assistant, and source management
- a `backend/` Express API for tenders, applications, sources, AI helpers, and scraping jobs
- Supabase as the main database and auth provider

## Current Status

Recent updates in this repo:

- backend routes for `/api/tenders`, `/api/applications`, `/api/tender-sources`, `/api/ai`, and `/api/email` are mounted and available
- dashboard, tenders, and assistant pages in the frontend now fetch data through backend APIs so requests are visible in browser dev tools
- the frontend scrape route uses a Supabase admin client for inserts and now reports duplicate and insert errors instead of silently returning `0 inserted`

## Repository Structure

```text
.
├── frontend/                  # Next.js 16 frontend
│   ├── app/
│   │   ├── (dashboard)/       # Shared dashboard route-group components
│   │   ├── dashboard/         # Public dashboard routes mounted in app router
│   │   ├── api/               # Next.js API routes, including /api/scrape
│   │   ├── auth/              # Auth pages
│   │   └── ...
│   ├── components/            # UI and feature components
│   ├── lib/                   # API client, Supabase helpers, types, dashboard helpers
│   ├── hooks/
│   ├── styles/
│   ├── .env.local
│   └── package.json
├── backend/                   # Express backend
│   ├── routes/                # Mounted API routes
│   ├── services/              # Scraping and AI pipeline services
│   ├── jobs/                  # Worker/scheduler entrypoints
│   ├── queue/                 # BullMQ queue code
│   ├── scripts/               # SQL setup/seed scripts and utilities
│   ├── .env
│   ├── server.js
│   └── package.json
├── shared/
├── package.json               # Monorepo convenience scripts
└── README.md
```

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI / shadcn-style components
- Supabase SSR/client helpers

### Backend

- Node.js
- Express
- Supabase JS
- BullMQ + Redis
- Cheerio, Axios, Puppeteer, Playwright
- OpenAI SDK

## How Data Flows

### Dashboard and Tender Pages

The frontend now fetches tender-related data through the backend API for browser-visible requests:

- dashboard page fetches tenders, applications, and sources through `frontend/lib/api/client.ts`
- tenders page fetches `/api/tenders` and `/api/tender-sources`
- assistant page fetches `/api/tenders?limit=10`

### Scraping

There are two scraping paths in the repo:

1. `frontend/app/api/scrape/route.ts`
   Used by the Sources UI when clicking `Scrape Now`.
   This route scrapes the source page, attempts inserts into Supabase, logs scrape activity, and now uses a Supabase admin client.

2. `backend/routes/scrape-tenders.js`
   The backend production-style scraping endpoint and queue entrypoint.

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
- optional query params currently supported include `status` and `limit`

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

## Environment Variables

### Frontend (`frontend/.env.local`)

Required for current local development:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is required by `frontend/app/api/scrape/route.ts` for tender inserts during scraping
- restart the Next.js dev server after changing `.env.local`

### Backend (`backend/.env`)

Typical local setup:

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

## Setup

### 1. Install Dependencies

From the repo root:

```bash
pnpm install
```

If needed, also install inside each app:

```bash
cd frontend && pnpm install
cd ../backend && pnpm install
```

### 2. Set Up Supabase

Run the SQL files in `backend/scripts/` against your Supabase database:

1. `001_create_tables.sql`
2. `002_seed_data.sql`
3. `003_user_profiles.sql`

### 3. Start the Apps

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

### 4. Open the App

- frontend: `http://localhost:3000`
- backend: `http://localhost:3001`
- backend health check: `http://localhost:3001/health`

## Useful Commands

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

## Frontend Pages

Main dashboard-related routes:

- `/dashboard`
- `/dashboard/tenders`
- `/dashboard/tenders/[id]`
- `/dashboard/applications`
- `/dashboard/assistant`
- `/dashboard/sources`
- `/dashboard/settings`

Auth and public routes:

- `/signin`
- `/signup`
- `/forgot-password`
- `/landing`

## Known Notes

- The frontend currently mixes backend API usage and direct Supabase usage in different areas of the app. Dashboard, tenders, and assistant pages have already been moved to backend API fetches.
- The Sources UI still triggers the frontend Next API route at `/api/scrape`.
- There is an existing unrelated TypeScript issue in `frontend/components/auth/auth-form.tsx` around the sign-up response union type.
- When testing newly added backend routes, restart the backend dev server to avoid hitting an older process that still returns `{"error":"Route not found"}`.

## Suggested Next Cleanup

- move all tender/application/source reads to the backend API consistently
- decide on one scraping path to keep: frontend `/api/scrape` or backend `/api/scrape-tenders`
- centralize Supabase admin access to avoid duplicated insert logic
- add request-level error surfacing in the Sources UI for scrape failures
