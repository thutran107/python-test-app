# CLAUDE.md — PyTest

This file defines conventions and preferences for Claude Code when working on this project. Read this before making any changes.

---

## Project Overview

PyTest is a Python learner assessment and practice platform. Admins create tests from a curated question bank (MC, open answer, coding), generate magic invite links, and review results. Learners take timed assessments with real Python execution (Pyodide) and get instant graded results with topic-level feedback. See `PRD.md` for full requirements.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19
- **Styling:** Tailwind CSS 4 (brutalist design system — `brutal-card`, `brutal-border`, `brutal-button`, `brutal-shadow`)
- **Icons:** Lucide React
- **Auth & Database:** Supabase (Auth with Google OAuth, PostgreSQL, RLS)
- **Python Execution:** Pyodide (client-side WebAssembly)
- **Hosting:** Dokploy (self-hosted)

---

## Code Style

- Use **TypeScript** throughout — no plain `.js` files
- Prefer `async/await` over `.then()` chains
- Use named exports for components, default exports only for Next.js pages/routes
- No inline styles — use Tailwind utility classes only
- Avoid `any` types; define proper interfaces and types

---

## Folder Structure

```
/app                        → Next.js App Router pages & layouts
  page.tsx                  → Main portal (admin dashboard, taker view, practice mode)
  practice-view.tsx         → Practice mode component
  /take-test/[testId]/      → Test-taking flow (server + client components)
  /api/                     → API route handlers
    /tests/                 → Test CRUD + assignments + link generation
    /take-test/[testId]/    → Token validation, test submission, grading
    /admin/                 → Results, stats, CSV export
/lib
  /supabase.ts              → Supabase clients (browser + admin)
  /grading.ts               → Test grading logic
  /hooks/use-pyodide.ts     → Pyodide lifecycle hook
  /question-bank/           → Question bank: types, questions, test builder, utils
/supabase
  /migrations/              → SQL migration files
```

---

## Supabase Conventions

- Always use the **supabaseAdmin** client (service role) for API routes
- Use the **supabaseBrowser** client only in client components for auth
- Never expose the `SUPABASE_SERVICE_ROLE_KEY` on the client side
- Always handle Supabase errors explicitly — don't silently swallow them
- RLS is enabled on all tables

---

## Routing & Auth

- No middleware.ts — admin routes currently use service role key without per-user role checks
- Test takers access tests via magic link tokens (`/take-test/[testId]?token=...`)
- Optional Google OAuth enriches the taker's profile but isn't required to start a test
- Auth is required to submit a test (recipient must exist)

---

## API Routes

- All API routes live in `/app/api/`
- Use proper HTTP status codes — don't return `200` for errors
- Return consistent JSON shapes
- Token validation for test-taking routes uses `access_token` query param

---

## UI Conventions

- **Brutalist design** — bold borders (2-3px), high contrast, strong typography
- Color tokens: `ph-red`, `ph-blue`, `ph-yellow`, `ph-green`, `ph-dark`, `ph-surface`, `ph-bg`
- Status badges: Draft (gray), Published (green), Pass (green), Fail (red)
- Modals follow pattern: fixed overlay with `bg-black/70`, `brutal-card` container
- Mobile responsive via Tailwind responsive classes

---

## Environment Variables

Store in `.env.local` (never commit this file):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=           # Production URL for magic links
```

---

## Do Not

- Do not use `localStorage` or `sessionStorage` for auth — Supabase handles sessions
- Do not fetch data in client components if a server component can do it
- Do not hardcode topic lists — use `ALL_TOPICS` from question bank
- Do not skip error handling on Supabase queries
- Do not create new pages without checking if a route already exists in `/app`
