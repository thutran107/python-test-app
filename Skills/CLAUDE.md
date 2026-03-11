# CLAUDE.md — PyTest

This file defines conventions and preferences for Claude Code when working on this project. Read this before making any changes.

---

## Project Overview

PyTest is a beginner Python assessment platform. Admins generate multiple-choice tests via an n8n webhook, learners take them through a clean UI, and admins review results on a dashboard. See `pytest_prd.md` for full requirements.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth & Database:** Supabase (Auth, PostgreSQL, RLS)
- **Hosting:** Vercel
- **Test Generation:** n8n webhook integration

---

## Code Style

- Use **TypeScript** throughout — no plain `.js` files
- Prefer `async/await` over `.then()` chains
- Use named exports for components, default exports only for Next.js pages/routes
- Keep components small and single-purpose — split into smaller files if a component exceeds ~150 lines
- No inline styles — use Tailwind utility classes only
- Avoid `any` types; define proper interfaces and types in `/types`

---

## Folder Structure

```
/app                    → Next.js App Router pages & layouts
  /admin                → Admin-only routes
  /dashboard            → Learner dashboard
  /test/[id]            → Test-taking flow
  /api                  → API route handlers (including /api/receive-test)
/components
  /ui                   → shadcn/ui primitives (auto-generated, don't edit)
  /shared               → Reusable app components (buttons, badges, modals)
  /learner              → Learner-specific components
  /admin                → Admin-specific components
/lib
  /supabase.ts          → Supabase client (browser + server)
  /utils.ts             → Shared utility functions
/types
  /index.ts             → Shared TypeScript interfaces (Test, Question, Session, etc.)
/hooks                  → Custom React hooks
```

---

## Supabase Conventions

- Always use the **server-side Supabase client** for API routes and server components
- Use the **browser client** only in client components that need real-time or user-triggered actions
- Never expose the `service_role` key on the client side
- Always handle Supabase errors explicitly — don't silently swallow them
- RLS is enabled on all tables — do not bypass it with the service role client except in `/api` route handlers where necessary

---

## Component Conventions

- Use **shadcn/ui** components as the base (Button, Card, Badge, Table, Dialog, etc.)
- Add new shadcn components with: `npx shadcn-ui@latest add <component>`
- Do not modify files inside `/components/ui` — extend them in `/components/shared` instead
- All forms use **react-hook-form** + **zod** for validation
- Charts use **recharts** (already a shadcn/ui dependency)

---

## Routing & Auth

- Middleware (`/middleware.ts`) handles route protection — check this before adding new protected routes
- Admin routes (`/admin/**`) require `role === 'admin'`
- Learner routes (`/dashboard`, `/test/**`) require authenticated user with any role
- Redirect unauthenticated users to `/login`
- After login, redirect based on role: admins → `/admin`, learners → `/dashboard`

---

## API Routes

- All API routes live in `/app/api/`
- Use proper HTTP status codes — don't return `200` for errors
- Validate all incoming payloads before touching the database
- The n8n webhook receiver lives at `/api/receive-test` — treat this as a critical path, validate the payload shape strictly
- Return consistent JSON shapes: `{ data, error }` pattern

---

## State Management

- Prefer **server components + server actions** over client-side data fetching where possible
- Use `useState` / `useReducer` for local UI state only
- For test-taking session state (current question, selected answers), use `useState` in the test page — no need for global state
- No external state libraries (no Redux, Zustand) for MVP

---

## UI & UX Rules

- **Mobile-first** — design for small screens, enhance for desktop
- Minimum tap target size: 44px height for all interactive elements
- Answer option buttons (A/B/C/D) must be visually distinct and large
- Show loading states on all async actions (use shadcn `Skeleton` or `Spinner`)
- Show error states — never leave the user with a blank screen on failure
- Confirm destructive actions with a Dialog modal (e.g. test submission, closing a test)
- Use shadcn `Badge` for status labels: Draft (gray), Published (blue), Closed (slate), Pass (green), Fail (red)

---

## Environment Variables

Store in `.env.local` (never commit this file):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
```

Reference with `process.env.VARIABLE_NAME` — always validate that required env vars exist at startup.

---

## Do Not

- Do not use `localStorage` or `sessionStorage` for auth — Supabase handles sessions via cookies
- Do not fetch data in client components if a server component can do it
- Do not hardcode topic lists or question counts — these should come from config or the admin form
- Do not skip error handling on Supabase queries
- Do not create new pages without checking if a route already exists in `/app`
