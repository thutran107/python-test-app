# PyTest — Python Learner Assessment Platform

A focused assessment and practice platform for Python learners. Instructors create tests from a curated question bank, share magic invite links, and review results through an analytics dashboard. Learners take timed assessments with real Python execution in the browser and get instant graded feedback.

## Core Loop

```
Create Test → Generate Magic Link → Learner Takes Test → Auto-Grade → Admin Reviews Results
```

## Key Features

- **Three question types** — Multiple choice, open-ended text, and coding exercises in a single test
- **Real Python execution** — Coding questions run actual Python in the browser via Pyodide (WebAssembly)
- **Zero-friction access** — Token-based magic links mean learners don't need accounts to start
- **Instant feedback** — Per-question breakdowns with explanations, topic performance bars, and pass/fail results
- **Admin dashboard** — Stats, per-learner detail modals with hover tooltips, CSV/PDF export
- **Practice mode** — Self-directed coding drills filtered by topic, difficulty, and exercise type
- **Curated question bank** — 6 topics (strings, loops, lists, tuples, dictionaries, sorting) across 3 difficulty levels

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Design | Brutalist design system |
| Icons | Lucide React |
| Auth & DB | Supabase (Google OAuth + PostgreSQL + RLS) |
| Python Runtime | Pyodide (client-side WebAssembly) |
| Hosting | Dokploy (self-hosted) |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run database migrations

Apply the SQL migrations in `supabase/migrations/` to your Supabase project (via the Supabase dashboard SQL editor or the CLI):

- `001_initial_schema.sql` — tables, RLS policies, indexes
- `002_add_invited_email.sql` — additional fields

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx                    → Admin dashboard (test creation, question bank, results)
  practice-view.tsx           → Practice mode
  take-test/[testId]/         → Test-taking flow (server + client components)
  api/
    tests/                    → Test CRUD, assignments, link generation
    take-test/[testId]/       → Token validation, submission, grading
    admin/                    → Results, stats, CSV export
lib/
  supabase.ts                 → Supabase clients (browser + admin)
  grading.ts                  → Test grading logic
  hooks/use-pyodide.ts        → Pyodide lifecycle hook
  question-bank/              → Question bank: types, topics, test builder
supabase/
  migrations/                 → SQL migration files
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Runbook

### Quick start

```bash
# 1. Copy the env template and fill in your values
cp .env.template .env.local

# 2. Build and run
docker compose up --build -d

# 3. Verify
curl http://localhost:3000/api/health
# → {"status":"ok","timestamp":"..."}
```

### Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build -d` | Build image and start in background |
| `docker compose logs -f app` | Tail application logs |
| `docker compose down` | Stop and remove containers |
| `docker compose up -d --build` | Rebuild after code changes |

### Health check

The container has a built-in health check hitting `GET /api/health` every 30 seconds. Check status with:

```bash
docker compose ps
```

## License

Private — not licensed for redistribution.
