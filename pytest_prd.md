# PyTest — Python Learner Assessment Platform
### Product Requirements Document — MVP v1.0

---

## Meta

| Field | Value |
|-------|-------|
| Version | 1.0 — MVP |
| Scope | Beginner Python · Multiple Choice · Admin Dashboard |
| Auth | Supabase Auth (email/password + magic link) |
| Test Generation | n8n Agent → Webhook to App |
| Stack | Next.js + Tailwind + shadcn/ui + Supabase + Vercel |

---

## 1. Overview & Purpose

PyTest is a focused assessment platform for beginner Python learners. Instructors trigger an n8n agent to generate fresh multiple-choice tests covering core Python concepts — strings, loops, lists, tuples, dictionaries, and more. Learners take tests through a clean, intuitive UI, and admins review results via a live dashboard.

The MVP is intentionally scoped to ship fast and validate the core loop: **generate → take → review**. Future iterations will expand toward code execution challenges (LeetCode-style).

---

## 2. Goals & Success Metrics

### Primary Goals
- Enable admin to trigger n8n agent and publish a Python quiz to learners
- Learners can log in, take a timed multiple-choice test, and submit answers
- Admin can view per-learner and per-question results on a dashboard
- Supabase handles all auth and data persistence

### Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Test completion rate | > 80% of started tests submitted |
| Avg time to generate test via n8n | < 15 seconds |
| Admin dashboard load time | < 2 seconds |
| Auth success rate | > 99% uptime via Supabase |

---

## 3. User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Learner** | Student taking the test | Log in, view assigned test, submit answers, view own results |
| **Admin** | Trainer / Instructor | Trigger test gen, publish tests, view all submissions & scores, manage learners |

> Role is stored in Supabase user metadata or a `roles` table. Protected routes enforced via middleware.

---

## 4. User Flows

### 4.1 Admin Flow — Generate & Publish Test
1. Admin logs in via Supabase Auth
2. Navigates to **Tests > New Test**
3. Configures: topic(s), number of questions, difficulty = beginner
4. Clicks **Generate** → app fires `POST` to n8n webhook
5. n8n agent generates MCQ questions, returns JSON to app's `/api/receive-test`
6. Admin previews questions, edits if needed, then clicks **Publish**
7. Test becomes visible to assigned learners (or all learners)

### 4.2 Learner Flow — Take Test
1. Learner logs in via Supabase Auth (email/password or magic link)
2. Dashboard shows available tests with status: **New**, **In Progress**, **Completed**
3. Learner clicks **Start Test** — timer begins (if configured)
4. One question per screen, A/B/C/D options, progress bar at top
5. Learner can navigate back/forward before submitting
6. Clicks **Submit** → answers saved to Supabase, score calculated immediately
7. Results screen shows score, correct answers, and explanations

### 4.3 Admin Flow — Review Results
1. Admin opens Dashboard: summary cards (total submissions, avg score, completion rate)
2. Drills into a specific test → per-question analytics
3. Views per-learner breakdown: score, time taken, answers per question
4. Filter by test, topic, or learner

---

## 5. Feature List (MVP Scope)

### 5.1 Authentication (Supabase)
- Email + password sign-up / login
- Magic link login option
- Role assignment: `learner` vs `admin` (Supabase user metadata or roles table)
- Protected routes — learners cannot access admin pages

### 5.2 Test Generation (n8n Integration)
- Admin form: topic tags, number of questions (10–20), difficulty = beginner
- App POSTs params to n8n webhook endpoint
- n8n agent generates questions and POSTs back to `/api/receive-test`
- Questions stored in Supabase: question text, 4 options, correct answer index, explanation, topic tag
- Admin preview screen before publishing

### 5.3 Test-Taking UI
- Clean card-based layout, one question per screen
- Large readable answer buttons (A, B, C, D) — accessible, mobile-friendly
- Progress bar showing question X of N
- Optional countdown timer (configurable per test)
- Back/Next navigation before final submit
- Confirmation modal before submission

### 5.4 Results Screen (Learner)
- Overall score (e.g. 8/10, 80%)
- Per-question review: learner's answer vs correct answer + explanation
- Pass/fail indicator based on configurable threshold (default: 70%)

### 5.5 Admin Dashboard
- Overview cards: total tests, total submissions, avg score, active learners
- Test list with status (Draft, Published, Closed)
- Per-test view: score distribution chart, % correct per question
- Per-learner view: score, time taken, submission timestamp
- Filter by test, topic, or learner

---

## 6. Data Model (Supabase / PostgreSQL)

```sql
-- Users (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  email text,
  role text check (role in ('learner', 'admin')) default 'learner',
  full_name text,
  created_at timestamptz default now()
);

-- Tests
create table tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic_tags text[],
  question_count int,
  status text check (status in ('draft', 'published', 'closed')) default 'draft',
  time_limit_mins int,               -- null = no timer
  pass_threshold int default 70,     -- percentage
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Questions
create table questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id) on delete cascade,
  body text not null,
  options jsonb not null,            -- ["option A", "option B", "option C", "option D"]
  correct_index int not null,        -- 0–3
  explanation text,
  topic text,
  position int                       -- question order
);

-- Test Sessions (one per learner per test attempt)
create table test_sessions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id),
  user_id uuid references profiles(id),
  started_at timestamptz default now(),
  submitted_at timestamptz,
  score int,                         -- percentage 0–100
  status text check (status in ('in_progress', 'submitted')) default 'in_progress'
);

-- Answers
create table answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references test_sessions(id) on delete cascade,
  question_id uuid references questions(id),
  selected_index int,                -- 0–3, null if skipped
  is_correct boolean
);
```

### RLS Policies (summary)
- `profiles`: users can read/update own row; admins can read all
- `tests`: admins can CRUD; learners can read published only
- `questions`: admins can CRUD; learners can read questions for their active session
- `test_sessions`: users can read/insert own; admins can read all
- `answers`: users can insert/read own; admins can read all

---

## 7. Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Next.js 14 (App Router) | File-based routing, server components |
| Styling | Tailwind CSS + shadcn/ui | Fast to build, easy to upgrade |
| Auth & DB | Supabase | Auth, PostgreSQL, RLS, real-time |
| Test Generation | n8n (self-hosted or cloud) | Webhook trigger → AI agent → POST back |
| Hosting | Vercel | Free tier sufficient for MVP |
| Future | Code execution sandbox | For LeetCode-style challenges (post-MVP) |

---

## 8. n8n Webhook Integration

### Trigger: App → n8n

```
POST https://<your-n8n>/webhook/generate-test
Content-Type: application/json
```

```json
{
  "topics": ["strings", "loops", "lists"],
  "count": 10,
  "level": "beginner"
}
```

### Response: n8n → App

n8n POSTs back to your app:

```
POST https://<your-app>/api/receive-test
Content-Type: application/json
```

```json
{
  "test_id": "uuid-of-draft-test",
  "questions": [
    {
      "body": "What does len('hello') return?",
      "options": ["3", "4", "5", "6"],
      "correct_index": 2,
      "explanation": "len() counts characters. 'hello' has 5 characters.",
      "topic": "strings"
    }
  ]
}
```

### App Webhook Handler (`/api/receive-test`)
- Validates payload
- Inserts questions into `questions` table linked to `test_id`
- Updates test status to `ready_to_preview`
- Returns `200 OK`

---

## 9. Page Structure

```
/                          → Landing / login redirect
/login                     → Supabase Auth UI
/dashboard                 → Learner: my tests
/test/[id]                 → Take test (question by question)
/test/[id]/results         → Results screen post-submit

/admin                     → Admin overview dashboard
/admin/tests               → Test list
/admin/tests/new           → Generate new test form
/admin/tests/[id]          → Preview & publish + analytics
/admin/tests/[id]/learners → Per-learner results for a test
```

---

## 10. UI Guidelines

### Learner-Facing
- Mobile-first, large tap targets (min 44px)
- High contrast, clear visual feedback on answer selection (highlight selected option)
- Distraction-free during test — no nav clutter
- Friendly, encouraging copy (not clinical)
- Post-submit: clear results with explanations to reinforce learning

### Admin-Facing
- Data-dense but scannable — tables, badges, charts
- shadcn/ui components for consistency
- Color-coded status badges: `Draft` (gray), `Published` (blue), `Closed` (black), `Pass` (green), `Fail` (red)
- Score distribution: bar chart (recharts)
- Question stats: table with % correct per question

---

## 11. MVP Milestones

| Phase | Deliverable | Est. Effort |
|-------|-------------|-------------|
| Phase 1 | Supabase setup: schema, auth, RLS policies | 1–2 days |
| Phase 2 | n8n workflow: receive trigger, generate Qs, POST back | 1–2 days |
| Phase 3 | Admin UI: test generation form + preview + publish | 2–3 days |
| Phase 4 | Learner UI: test-taking flow + results screen | 2–3 days |
| Phase 5 | Admin Dashboard: overview + per-test + per-learner | 2–3 days |
| Phase 6 | QA, polish, deploy to Vercel | 1–2 days |

**Total estimate: ~10–15 days**

---

## 12. Out of Scope (Post-MVP)

- Code execution / LeetCode-style challenges
- Leaderboard or gamification
- Detailed learner progress tracking over time
- Email notifications / test reminders
- CSV export of results
- Multi-language support
- Difficulty levels beyond beginner
- Question bank / reusable question library

---

## 13. Open Questions

- [ ] Should learners be able to retake a test, or is one attempt per test?
- [ ] Do all learners see the same published test, or are tests assigned per individual?
- [ ] Should the n8n webhook include an auth secret/token for security?
- [ ] Is there a need for an "instructor" role between admin and learner?

---

*This PRD is a living document. Update as scope evolves.*
