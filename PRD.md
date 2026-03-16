# PyTest — Python Learner Assessment Platform

### Product Requirements Document — v2.0 (Deployment-Ready)

---

## Meta

| Field | Value |
|-------|-------|
| Version | 2.1 — Full Vision (Deployment-Ready) |
| Last Updated | March 13, 2026 |
| Scope | Beginner–Advanced Python · MCQ + Open Answer + Coding · Admin Dashboard · Practice Mode |
| Auth | Supabase Auth (Google OAuth + token-based magic links) |
| Question Source | Curated question bank (Phase 1) · AI generation via Gemini (Phase 2) |
| Stack | Next.js 15 · React 19 · Tailwind CSS 4 · Supabase · Pyodide · Dokploy |

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [User Flows](#4-user-flows)
5. [Feature Specification](#5-feature-specification)
6. [Question Bank Architecture](#6-question-bank-architecture)
7. [Data Model](#7-data-model)
8. [API Reference](#8-api-reference)
9. [Tech Stack & Architecture](#9-tech-stack--architecture)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Deployment Guide (Dokploy)](#11-deployment-guide-dokploy)
12. [Security & Auth Hardening](#12-security--auth-hardening)
13. [Performance & Scale](#13-performance--scale)
14. [Phase 2 Roadmap](#14-phase-2-roadmap)
15. [Open Questions & Decisions](#15-open-questions--decisions)

---

## 1. Overview & Purpose

PyTest is a focused assessment and practice platform for Python learners. Instructors create tests from a curated question bank spanning core Python concepts — strings, loops, lists, tuples, dictionaries, and sorting. Learners access tests via token-based magic links (no account required), take timed assessments with multiple question types including live Python code execution in the browser, and receive instant graded results with explanations. Admins review submissions through a data-rich dashboard with export capabilities.

The platform also offers an open **Practice Mode** where learners independently drill coding exercises filtered by topic, difficulty, and exercise type — with real-time Python execution and hint support.

### Core Value Loop

```
Create Test → Generate Magic Link → Learner Takes Test → Auto-Grade → Admin Reviews Results
```

### What Makes PyTest Different

- **Zero-friction access**: Token-based links mean learners don't need accounts to take a test. Optional Google OAuth enriches the experience but isn't required to start.
- **Real Python execution**: Coding questions run actual Python in the browser via Pyodide (WebAssembly) — not string matching or regex hacks.
- **Three question types in one test**: Multiple choice, open-ended text, and coding exercises can coexist in a single assessment.
- **Instant, detailed feedback**: Learners see per-question breakdowns with explanations immediately after submission.

---

## 2. Goals & Success Metrics

### Primary Goals

- Admins can create and publish Python assessments from a curated question bank in under 2 minutes
- Learners receive a link, take a timed test with MC/open/coding questions, and get instant results
- Coding questions execute real Python in-browser with test case validation
- Practice mode enables self-directed learning with filtering and hints
- Admin dashboard provides per-test and per-learner analytics with CSV export

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test completion rate | > 85% of started tests submitted | `test_attempts` where `completed_at IS NOT NULL` / total `started_at` |
| Pyodide load time | < 5 seconds on broadband | Client-side performance measurement |
| Admin dashboard load time | < 2 seconds | API response time for `/api/admin/stats` |
| Grading accuracy | 100% for MC, > 95% for open answer | Spot-check against manual grading |
| Uptime | > 99.5% | Dokploy/monitoring |
| Magic link delivery-to-start | < 30 seconds | Token generation to first page load |

---

## 3. User Roles & Permissions

| Role | Description | Auth Method | Key Permissions |
|------|-------------|-------------|-----------------|
| **Admin** | Instructor / Trainer | Google OAuth via Supabase | Create/edit/delete tests, generate magic links, view all submissions/scores, export CSV, manage assignments |
| **Learner (Authenticated)** | Test taker who signed in | Google OAuth (optional) | Take assigned tests, view own results, access practice mode |
| **Learner (Anonymous)** | Test taker via magic link only | Access token in URL | Take specific assigned test, view own results for that test |

### Permission Matrix

| Action | Admin | Auth Learner | Anon Learner |
|--------|-------|-------------|--------------|
| Create test | ✅ | ❌ | ❌ |
| Edit/delete test | ✅ | ❌ | ❌ |
| Generate magic link | ✅ | ❌ | ❌ |
| Take assigned test | ✅ | ✅ | ✅ (token required) |
| View own results | ✅ | ✅ | ✅ (same session) |
| View all results | ✅ | ❌ | ❌ |
| Export CSV | ✅ | ❌ | ❌ |
| Practice mode | ✅ | ✅ | ✅ |
| Admin dashboard | ✅ | ❌ | ❌ |

> **Implementation note**: Role enforcement currently relies on the Supabase service role key for admin API routes. A `profiles` table with explicit role assignment or Supabase RLS policies keyed to user metadata should be added before production deployment (see [Security Hardening](#12-security--auth-hardening)).

---

## 4. User Flows

### 4.1 Admin Flow — Create & Assign Test

```
1. Admin logs in via Google OAuth
2. Clicks "New Test" on dashboard
3. Configures test:
   ├── Test name
   ├── Topics (strings, loops, lists, tuples, sorting, dictionaries)
   ├── Difficulty levels (beginner, intermediate, advanced)
   ├── Question types (MC, open answer, coding)
   ├── Question count per type
   ├── Duration (minutes)
   └── Pass threshold (default 70%)
4. Builder shows available questions matching config
5. Admin can auto-select or hand-pick individual questions
6. Reviews question set → can **swap** any question for an alternative (same topic + difficulty)
7. Reviews final set → Saves test (status: draft)
7. Publishes test (status: published)
8. Generates magic link(s):
   ├── Enters recipient email + name (optional)
   ├── System generates unique access token
   └── Copies shareable URL: /take-test/{testId}?token={accessToken}
9. Shares link with learner(s) via email/Slack/etc.
```

### 4.2 Learner Flow — Take Test

```
1. Receives magic link URL
2. Opens link → lands on test start page
3. Optionally signs in with Google (enriches their profile)
4. If proctoring enabled → sees lockdown notice, acknowledges terms
5. Clicks "Start Test" → enters fullscreen (if proctored) → timer begins
5. Navigates questions:
   ├── MC: Select one of 4 options (A/B/C/D)
   ├── Open Answer: Type response in text field
   └── Coding: Write Python in editor, run against test cases
6. Can navigate forward/back, jump to any question
7. Progress bar shows completion status
8. Clicks "Submit" → confirmation modal
9. On submit:
   ├── Answers sent to API
   ├── Auto-graded (MC: exact match, Open: fuzzy match, Coding: test cases)
   └── Results calculated and stored
10. Results screen shows:
    ├── Level achievement banner (if passed: "You've reached the expected {level}!")
    ├── Overall score (X/Y, percentage)
    ├── Pass/fail status
    ├── Topic performance breakdown (strengths + areas for improvement)
    ├── Per-question breakdown with correct answers
    └── Explanations for each question
```

### 4.3 Learner Flow — Practice Mode

```
1. Navigates to practice mode (no auth required)
2. Filters by:
   ├── Difficulty: easy, medium, hard
   ├── Topic: strings, lists, loops, tuples, sorting, dictionaries
   └── Exercise type: fill blank, write from scratch, fix bug, predict output
3. Gets a coding exercise matching filters
4. Writes Python code in editor
5. Clicks "Run" → Pyodide executes code client-side
6. Sees test case results (pass/fail per case)
7. If wrong → sees **targeted explanation** of what went wrong + how to fix it
8. Can request progressive hints → eventually view full annotated solution
9. Can request hint (progressive disclosure)
10. Moves to next exercise
```

### 4.4 Admin Flow — Review Results

```
1. Admin opens dashboard
2. Sees test list with assignment counts and completion stats
3. Clicks into specific test → sees:
   ├── Summary cards: total attempts, avg score, pass rate, learners who reached expected level
   ├── Topic performance heatmap (cohort-wide strengths + weak areas)
   ├── Per-question accuracy breakdown
   ├── Individual learner results with scores, topic breakdown, and timestamps
   └── Detailed answer-by-answer review per learner
4. Exports results as CSV (now includes topic scores per learner)
```

### 4.5 Timer & Auto-Submit Flow

```
1. Test starts → countdown timer begins (top of screen)
2. Timer reaches 0:00 → auto-submit triggers
3. All current answers saved as-is
4. Learner redirected to results page
5. Assignment status set to "timed_out"
```

---

## 5. Feature Specification

### 5.1 Authentication & Access Control

| Feature | Status | Details |
|---------|--------|---------|
| Google OAuth sign-in | ✅ Built | Via Supabase Auth, optional for test takers |
| Token-based magic links | ✅ Built | Crypto-random tokens, one-time use per assignment |
| Admin route protection | ⚠️ Partial | Uses service role key; needs explicit role checks |
| Session management | ✅ Built | Supabase session handling with auto-refresh |

**Token lifecycle**: Generated → Pending → Started (on first access) → Completed/Timed Out (on submit). A completed token cannot be reused.

### 5.2 Test Builder

| Feature | Status | Details |
|---------|--------|---------|
| Topic selection | ✅ Built | 6 topics: strings, loops, lists, tuples, sorting, dictionaries |
| Difficulty filtering | ✅ Built | beginner, intermediate, advanced |
| Question type selection | ✅ Built | MC, open answer, coding |
| Auto-select mode | ✅ Built | Randomly picks N questions matching criteria |
| Manual pick mode | ✅ Built | Browse and hand-pick specific questions |
| Question preview | ✅ Built | Full preview before publishing |
| Duration config | ✅ Built | Minutes, enforced client-side with auto-submit |
| Pass threshold | ✅ Built | Configurable percentage (default 70%) |
| Question swap | 🔲 New | Swap any selected question with another from same topic + difficulty |

#### 5.2.1 Question Swap

During test creation (and editing a draft), after the admin has selected or auto-generated a question set, they should be able to **swap any individual question** for an alternative from the question bank. This lets the admin fine-tune the test without rebuilding from scratch.

**How it works:**

1. In the test builder preview, each question card shows a **"Swap" button** (e.g., a shuffle/rotate icon)
2. Clicking "Swap" opens a mini-picker that:
   - Queries the question bank for alternatives matching the **same topic** and **same difficulty** as the current question
   - Excludes questions already selected in this test (no duplicates)
   - Optionally filters by the same question type (MC/open/coding) — or allows the admin to broaden the filter
3. The picker shows a scrollable list of candidates with previews (question text, type badge, ID)
4. Admin clicks on a candidate to preview it in full, then confirms "Use this question"
5. The original question is replaced in the test's `questions_json` array; the total count stays the same

**Edge cases:**

- If no alternatives exist for the same topic + difficulty (all questions already used or bank exhausted), show a message: "No alternative questions available for {topic} at {difficulty} level. Try broadening the difficulty filter."
- If the test is already published, swap should not be allowed (admin must unpublish/clone first)
- The swap action should be undoable within the builder session (keep the previous question in memory until the test is saved)

**UI mockup:**

```
┌─────────────────────────────────────────────────────┐
│  Q3: What does len('hello') return?     [MC]        │
│  Topic: Strings  |  Difficulty: Beginner            │
│                                                     │
│  A) 3   B) 4   C) 5 ✓   D) 6                      │
│                                       [🔄 Swap]     │
└─────────────────────────────────────────────────────┘
                        │
                        ▼  (on click)
┌─────────────────────────────────────────────────────┐
│  Swap question — Strings / Beginner                 │
│  ───────────────────────────────────────────         │
│  ○ str_mc_004: "What is 'hello'[1]?"       [MC]    │
│  ○ str_mc_007: "What does .upper() do?"    [MC]    │
│  ○ str_open_002: "Name 2 string methods"   [Open]  │
│  ○ str_code_003: "Reverse a string"        [Code]  │
│                                                     │
│                               [Cancel]  [Use This]  │
└─────────────────────────────────────────────────────┘
```

**Test builder helper function:**

```typescript
// lib/question-bank/test-builder.ts
function getSwapCandidates(
  currentQuestion: BankQuestion,
  alreadySelectedIds: string[],
  options?: { sameType?: boolean }
): BankQuestion[] {
  return allQuestions.filter(q =>
    q.topic === currentQuestion.topic &&
    q.difficulty === currentQuestion.difficulty &&
    q.id !== currentQuestion.id &&
    !alreadySelectedIds.includes(q.id) &&
    (options?.sameType ? q.type === currentQuestion.type : true)
  );
}
```

### 5.3 Question Types

#### Multiple Choice

- 4 options (A, B, C, D)
- Single correct answer (stored as `correct_index: 0-3`)
- Explanation shown post-submission
- Grading: exact index match → 1 point

#### Open Answer

- Free-text response field
- `acceptable_answers` array for grading (case-insensitive comparison)
- Explanation shown post-submission
- Grading: response matches any acceptable answer → 1 point

#### Coding

- Python code editor (monospace, syntax-aware)
- Four exercise sub-types:
  - **Fill in the blank**: Complete a partial function
  - **Write from scratch**: Implement a function from description
  - **Fix the bug**: Debug provided code
  - **Predict output**: Determine what code prints
- Test cases with `input` and `expected_output`
- Execution via Pyodide (client-side WebAssembly Python)
- Hint system (progressive, per-question)
- Grading: all test cases pass → 1 point

### 5.4 Test-Taking UI

| Feature | Status | Details |
|---------|--------|---------|
| One question per screen | ✅ Built | Card-based layout |
| Progress bar | ✅ Built | Shows X of N, clickable for direct navigation |
| Back/Next navigation | ✅ Built | Arrow buttons + keyboard support |
| Timer display | ✅ Built | Countdown in header, auto-submit on expiry |
| Answer persistence | ✅ Built | Answers held in state during session |
| Submit confirmation | ✅ Built | Modal before final submission |
| Mobile responsive | ✅ Built | Tailwind responsive classes |
| Proctoring mode | 🔲 New (Phase 1) | Browser lockdown with violation detection and admin-facing flag log |

### 5.4.1 Proctoring — Browser Lockdown (Phase 1)

When an admin enables proctoring for a test, the test-taking experience enters a **lockdown mode** that deters cheating through browser-level restrictions and activity monitoring. This is not camera-based surveillance — it's a lightweight, privacy-respecting approach that keeps honest students honest and flags suspicious behavior for the admin to review.

**Admin configuration (per test):**

The test builder should include a **"Proctoring"** toggle (default: off). When enabled, the admin can optionally configure:

- Fullscreen enforcement: on/off (default: on)
- Tab-switch detection: on/off (default: on)
- Copy/paste blocking: on/off (default: on)
- DevTools detection: on/off (default: on)
- Max violations before auto-submit: number (default: 3, 0 = unlimited warnings)

These settings are stored in the test's `config_json` field:

```typescript
interface TestConfig {
  // ... existing fields ...
  proctoring: {
    enabled: boolean;
    fullscreen: boolean;
    tab_switch_detection: boolean;
    copy_paste_blocking: boolean;
    devtools_detection: boolean;
    max_violations: number;    // 0 = warn only, never auto-submit
  };
}
```

**Lockdown behaviors (what the learner experiences):**

1. **Fullscreen enforcement**
   - On "Start Test" click, the app requests `document.documentElement.requestFullscreen()`
   - If the learner exits fullscreen (Esc key, F11), a warning overlay appears: "Please return to fullscreen to continue your test." The test is paused until they re-enter fullscreen.
   - Each exit is logged as a violation.

2. **Tab-switch / window blur detection**
   - Listen to `document.visibilitychange` and `window.blur` events
   - When the tab becomes hidden or loses focus, log a violation with timestamp
   - Show a warning overlay when the learner returns: "You navigated away from the test. This has been recorded. Violation {n} of {max}."
   - If `max_violations` is reached, auto-submit the test immediately with current answers

3. **Copy/paste blocking**
   - Disable `copy`, `cut`, and `paste` events on the test-taking container
   - For coding questions: allow paste **only within the code editor** (learners need to paste code they're writing, but shouldn't paste from external sources). Implementation note: this is a trade-off — blocking paste entirely in the code editor hurts UX for legitimate editing. Consider logging paste events instead of blocking them, and flagging for admin review.
   - Disable right-click context menu (`contextmenu` event) on the test page

4. **DevTools detection**
   - Detect DevTools opening via common techniques:
     - Monitor `window.outerWidth - window.innerWidth > threshold` (DevTools docked to side)
     - Monitor `window.outerHeight - window.innerHeight > threshold` (DevTools docked to bottom)
     - Use a timing-based `debugger` statement detector (detects breakpoint pauses)
   - On detection: log violation, show warning overlay
   - Note: DevTools detection is not 100% reliable (undocked DevTools, browser extensions). Treat it as a best-effort deterrent, not a guarantee.

5. **Window resize detection**
   - Monitor `window.resize` events for significant changes that suggest split-screen or snapping
   - Log as a minor violation (informational, not counted toward auto-submit threshold)

**Violation logging:**

Every violation is recorded with a timestamp and type, stored in the test submission:

```typescript
interface ProctoringViolation {
  type: "tab_switch" | "fullscreen_exit" | "copy_paste" | "devtools" | "resize";
  timestamp: string;          // ISO 8601
  details?: string;           // e.g., "Paste event in code editor"
  violation_number: number;   // running count
}

// Stored in test_attempts alongside answers
interface TestAttempt {
  // ... existing fields ...
  proctoring_violations: ProctoringViolation[];
  proctoring_auto_submitted: boolean;  // true if max violations triggered auto-submit
}
```

**Suggested schema addition:**

```sql
ALTER TABLE test_attempts ADD COLUMN proctoring_violations JSONB DEFAULT '[]';
ALTER TABLE test_attempts ADD COLUMN proctoring_auto_submitted BOOLEAN DEFAULT false;
```

**UI — Learner experience:**

Before test starts (if proctoring enabled):
```
┌──────────────────────────────────────────────────┐
│  🔒 This test has proctoring enabled             │
│                                                  │
│  To ensure a fair assessment, this test will:    │
│                                                  │
│  • Run in fullscreen mode                        │
│  • Detect if you switch tabs or windows          │
│  • Disable copy/paste outside the code editor    │
│  • Log any violations for your instructor        │
│                                                  │
│  Please close all other tabs and applications    │
│  before starting.                                │
│                                                  │
│  If you reach 3 violations, your test will be    │
│  automatically submitted with your current       │
│  answers.                                        │
│                                                  │
│              [I understand — Start Test]          │
└──────────────────────────────────────────────────┘
```

Warning overlay (on violation):
```
┌──────────────────────────────────────────────────┐
│  ⚠️ Violation detected                           │
│                                                  │
│  You switched away from the test window.         │
│  This has been recorded.                         │
│                                                  │
│  Violation 1 of 3                                │
│                                                  │
│              [Return to Test]                     │
└──────────────────────────────────────────────────┘
```

**UI — Admin results view:**

In the per-learner results drill-down, add a **proctoring column**:

```
┌────────────────────────────────────────────────────────────┐
│  Learner        Score    Time     Violations    Status     │
│  ───────        ─────    ────     ──────────    ──────     │
│  Alice          85%      14m      0             ✅ Clean   │
│  Bob            72%      18m      1             🟡 1 flag  │
│  Charlie        90%      8m       3             🔴 Auto-   │
│                                                  submitted │
└────────────────────────────────────────────────────────────┘
```

Clicking on a flagged learner shows the violation log with timestamps:

```
┌──────────────────────────────────────────────────┐
│  🔍 Proctoring Log — Bob                         │
├──────────────────────────────────────────────────┤
│                                                  │
│  12:03:22  🟡 Tab switch (returned after 4s)     │
│                                                  │
│  No other violations detected.                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Implementation notes:**

- All detection runs client-side. The violation log is sent with the test submission (alongside answers). This means a determined attacker could strip violations before submit — for the target audience (Python beginners), this is an acceptable trade-off. Server-side proctoring would require WebSocket connections and significantly more infrastructure.
- Mobile support: fullscreen API behavior varies on mobile. On mobile browsers, consider disabling fullscreen enforcement and relying on tab-switch detection only.
- The proctoring notice before the test is important for transparency and trust. Learners should always know they're being monitored.
- CSP headers must allow `blob:` for fullscreen API in some browsers.

**Limitations (be transparent with admins):**

- Not foolproof: a second device, a friend reading answers aloud, or printed notes are not detectable
- DevTools detection has known bypass methods
- Client-side logging can theoretically be tampered with
- This is a **deterrent**, not a guarantee — suitable for classroom/bootcamp settings, not high-stakes certification exams

### 5.5 Results & Grading

| Feature | Status | Details |
|---------|--------|---------|
| Instant grading | ✅ Built | Score calculated server-side on submit |
| Per-question breakdown | ✅ Built | Correct/incorrect with explanations |
| Pass/fail status | ✅ Built | Based on configurable threshold |
| Score persistence | ✅ Built | Stored in `test_attempts` table |
| Time tracking | ✅ Built | `time_spent_secs` recorded |
| Topic performance analysis | ✅ Built | Per-topic accuracy breakdown with progress bars, strength/developing/needs-work classification, sorted by performance. Shown on taker results screen when 2+ topics present |
| Level achievement | ✅ Built | Achievement banner at top of taker results: Outstanding (≥90%), Well Done (≥threshold), Keep Going (<threshold). Level label derived from question difficulties |

#### 5.5.1 Topic Performance Analysis (Learner Results View) — ✅ Implemented

After submission, the results screen includes a **"Performance by Topic"** section that groups the learner's answers by topic and calculates accuracy per topic. This gives learners actionable insight into what they know well and where to focus. Implemented in `app/take-test/[testId]/client.tsx` (`ResultsView` component). Computed client-side from graded answers + question topic data. Only shown when 2+ topics are present.

**How it works:**

1. On grading, the API groups all `GradedAnswer` objects by their parent question's `topic` field
2. For each topic, calculate: `correct_count / total_count → topic_accuracy_%`
3. Classify each topic into a performance tier:
   - **Strong** (≥80% correct): Displayed with a green indicator and encouraging label (e.g., "Great job!")
   - **Developing** (50–79% correct): Displayed with a yellow/amber indicator (e.g., "Getting there — review these concepts")
   - **Needs work** (<50% correct): Displayed with a red indicator (e.g., "Focus area — practice more on this topic")
4. Sort topics: strongest first, weakest last

**UI layout (learner results screen):**

```
┌─────────────────────────────────────────────┐
│  📊 Your Performance by Topic               │
├─────────────────────────────────────────────┤
│                                             │
│  Strings           ██████████░░  5/6  83%  │  ✅ Strong
│  Lists             ████████░░░░  4/6  67%  │  🟡 Developing
│  Loops             ██████████░░  3/3  100% │  ✅ Strong
│  Dictionaries      ████░░░░░░░░  2/5  40%  │  🔴 Needs work
│                                             │
│  💡 Areas to improve: Dictionaries, Lists   │
│  🌟 You're doing great with: Strings, Loops │
│                                             │
└─────────────────────────────────────────────┘
```

#### 5.5.2 Level Achievement Recognition — ✅ Implemented

The results screen displays a positive achievement banner at the top, above the score header. Implemented in `app/take-test/[testId]/client.tsx` (`ResultsView` component). The `passThreshold` is passed from `testInfo` to determine the tier. Level label is derived from the questions' difficulty fields.

**Logic:**

- The test has a `pass_threshold` (default 70%) — this is the **expected level**
- If `score_percentage >= pass_threshold`: Show achievement banner
- Tailor the message to the score range:
  - **≥ 90%**: "Outstanding! You've exceeded the expected {difficulty} level. You're ready for the next challenge."
  - **≥ pass_threshold and < 90%**: "Well done! You've reached the expected {difficulty} level for this assessment."
  - **< pass_threshold**: "Keep going! You're building your skills. Review the topics below and try again."
- The `{difficulty}` label comes from the test config (e.g., "beginner", "intermediate")

**UI layout (top of results screen, before per-question breakdown):**

```
┌─────────────────────────────────────────────┐
│  🎉 You've reached the expected             │
│     Beginner level!                         │
│                                             │
│     Score: 85%  (17/20)                     │
│     Time: 12 min 34 sec                     │
└─────────────────────────────────────────────┘
```

**Data model note:** The `topic` field already exists on every `BankQuestion` in `questions_json`, and `GradedAnswer` already contains `question_id` which can be joined back to the question's topic. **Current implementation:** Topic performance is computed client-side in the `ResultsView` component from graded answers + questions data. No `topic_scores` column has been added to `test_attempts` yet. Adding it is recommended for faster admin dashboard queries when the admin-side topic analytics are built.

**Future schema addition (for admin dashboard topic analytics):**

```sql
-- Add to test_attempts table when building admin topic analytics
ALTER TABLE test_attempts ADD COLUMN topic_scores JSONB;
-- Example value:
-- { "strings": { "correct": 5, "total": 6, "percentage": 83 },
--   "lists": { "correct": 4, "total": 6, "percentage": 67 }, ... }
```

### 5.6 Admin Dashboard

| Feature | Status | Details |
|---------|--------|---------|
| Test list | ✅ Built | All tests with status and assignment counts |
| Assignment management | ✅ Built | Clickable test cards → detail view with assignments list. Two-phase invite link modal: email/due-date/message form → copyable results. `invited_email` stored on assignments |
| Results overview | ✅ Built | Per-test aggregate stats |
| Per-learner drill-down | ✅ Built | Individual scores and answer review |
| Per-question analytics | ✅ Built | Accuracy rate per question |
| CSV export | ✅ Built | Full results download |
| Topic performance heatmap | 🔲 New | Aggregate topic accuracy across all learners for a test |
| Per-learner topic breakdown | 🔲 New | Topic strengths/weaknesses visible per learner in drill-down |
| Level attainment summary | 🔲 New | How many learners reached expected level vs. didn't |

#### 5.6.1 Admin Topic Analytics

The admin dashboard should surface topic-level performance data at two levels:

**Test-level view (aggregate across all learners):**

When an admin drills into a specific test's results, show a **"Performance by Topic"** section that aggregates all learners' topic scores. This helps the instructor identify which topics the cohort struggles with, informing future teaching focus.

```
┌──────────────────────────────────────────────────┐
│  📊 Cohort Performance by Topic                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Topic          Avg Accuracy   Learners Tested   │
│  ─────────────  ────────────   ───────────────   │
│  Strings            87%            24            │  ✅
│  Loops              74%            24            │  🟡
│  Lists              68%            24            │  🟡
│  Dictionaries       42%            20            │  🔴
│                                                  │
│  ⚠️ Cohort weak area: Dictionaries (42% avg)    │
│  ✅ Cohort strong area: Strings (87% avg)        │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Per-learner view:**

When the admin clicks into an individual learner's results, show the same topic breakdown as the learner sees — their per-topic accuracy with strength/weakness indicators. This allows the instructor to give targeted feedback.

**Level attainment summary (test-level):**

Add summary cards showing how the cohort performed against the expected level:

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ 18 / 24  │  │  75%     │  │  42%     │
│ Reached  │  │ Avg      │  │ Dicts    │
│ Level    │  │ Score    │  │ Weakest  │
└──────────┘  └──────────┘  └──────────┘
```

**API change:** The `/api/admin/stats` endpoint should include `topic_performance` in its response:

```typescript
// Updated response shape for GET /api/admin/stats
{
  total_attempts: number;
  avg_score: number;
  pass_rate: number;
  level_attainment: {
    reached: number;       // count of learners who passed
    total: number;         // total learners who submitted
    percentage: number;
  };
  per_question_accuracy: { [questionId: string]: number };
  topic_performance: {
    [topic: string]: {
      avg_accuracy: number;      // 0-100
      total_questions: number;
      learners_tested: number;
      classification: "strong" | "developing" | "needs_work";
    }
  };
}
```

### 5.7 Practice Mode

| Feature | Status | Details |
|---------|--------|---------|
| Topic filter | ✅ Built | All 6 topics |
| Difficulty filter | ✅ Built | Easy, medium, hard |
| Exercise type filter | ✅ Built | 4 coding exercise types |
| Live Python execution | ✅ Built | Pyodide with test case validation |
| Hint system | ✅ Built | Per-question hints |
| Self-paced navigation | ✅ Built | Move freely between exercises |
| Answer explanation feedback | 🔲 New | When answer is wrong, explain WHY it's wrong and HOW to fix it |

#### 5.7.1 Answer Explanation Feedback (Core Practice Feature)

This is the **most valuable feature** in practice mode. When a learner submits an incorrect answer, the platform should not just say "Wrong" — it should explain **what went wrong** and **how to fix it**. This turns every mistake into a learning moment.

**Behavior by question type:**

**Coding questions (fill blank, write from scratch, fix bug, predict output):**

When test cases fail after the learner runs their code:

1. **Show which test cases failed** with the learner's actual output vs. expected output (already built)
2. **Show a targeted explanation** that:
   - Identifies the likely mistake (e.g., "Your function returns the list instead of the length of the list")
   - Explains the correct approach conceptually (e.g., "The `len()` function returns the number of items. You need to call `len()` on your result before returning.")
   - Shows the corrected version of their specific code — or at minimum, the reference solution with annotations explaining each key line
3. **Progressive disclosure**: Don't dump the full solution immediately. Use this sequence:
   - **First attempt fails** → Show which test cases failed + a conceptual nudge (e.g., "Think about what `range()` returns — is it inclusive of the end value?")
   - **Second attempt fails** → Show a more specific hint pointing to the exact line/concept (e.g., "Look at line 3: `range(1, n)` excludes `n`. Did you mean `range(1, n+1)`?")
   - **Third attempt fails (or learner clicks "Show Solution")** → Reveal the full reference solution with line-by-line annotations

**Data sources for explanations:**

- **`explanation` field** (already exists on `BankQuestion`): A static explanation of the correct answer. This should be expanded for coding questions to include common mistakes.
- **`solution_code` field** (already exists): The reference implementation. Should be annotated with inline comments explaining key logic.
- **`hints[]` array** (already exists): Progressive hints. These should be written to address the most common wrong approaches.
- **New field — `common_mistakes`**: An array of typical errors and their explanations, to provide more targeted feedback when possible.

**Suggested schema addition to `BankQuestion`:**

```typescript
interface BankQuestion {
  // ... existing fields ...

  // NEW: Common mistakes with targeted explanations
  common_mistakes?: CommonMistake[];
}

interface CommonMistake {
  pattern: string;         // Description of the mistake (e.g., "off-by-one in range")
  detection?: string;      // Optional: regex or output pattern to auto-detect this mistake
  explanation: string;     // Why this is wrong
  fix: string;            // How to fix it
}
```

**Example for a "reverse a string" coding question:**

```typescript
{
  id: "str_code_003",
  question: "Write a function that reverses a string",
  solution_code: "def reverse_string(s):\n    return s[::-1]",
  common_mistakes: [
    {
      pattern: "Used reverse() method on string",
      detection: ".reverse()",
      explanation: "Strings don't have a .reverse() method in Python — that's a list method. Strings are immutable, so you can't reverse them in place.",
      fix: "Use slice notation s[::-1] to create a reversed copy, or convert to a list first with list(s), reverse it, then join back with ''.join()."
    },
    {
      pattern: "Returned a list instead of a string",
      detection: "\\[.*\\]",
      explanation: "Your function returned a list of characters instead of a string. When you use list() on a string, you get individual characters in a list.",
      fix: "After reversing, use ''.join(reversed_list) to convert the list of characters back into a string."
    },
    {
      pattern: "Off-by-one in manual loop",
      explanation: "If you're using a loop with range(), remember that range(len(s)-1, -1, -1) goes from the last index down to 0 inclusive. Missing the -1 step or wrong bounds will skip characters.",
      fix: "Try: for i in range(len(s)-1, -1, -1): result += s[i]"
    }
  ]
}
```

**UI layout (after failed attempt in practice mode):**

```
┌─────────────────────────────────────────────────────┐
│  ❌ 2 of 3 test cases failed                        │
│                                                      │
│  Test case 1: ✅ Passed                              │
│    Input: "hello" → Output: "olleh"                  │
│                                                      │
│  Test case 2: ❌ Failed                              │
│    Input: "Python" → Expected: "nohtyP"              │
│                       Your output: ['n','o','h',...]  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ 💡 What went wrong:                            │  │
│  │                                                │  │
│  │ Your function returned a list of characters    │  │
│  │ instead of a string. When you use list() on    │  │
│  │ a string, you get individual characters in     │  │
│  │ a list.                                        │  │
│  │                                                │  │
│  │ 🔧 How to fix it:                              │  │
│  │                                                │  │
│  │ After reversing, use ''.join(reversed_list)    │  │
│  │ to convert the list of characters back into    │  │
│  │ a string.                                      │  │
│  │                                                │  │
│  │              [Try Again]  [Show Solution]       │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**When "Show Solution" is clicked:**

```
┌────────────────────────────────────────────────────┐
│  ✅ Reference Solution                              │
│                                                     │
│  def reverse_string(s):                             │
│      return s[::-1]                                 │
│      # ↑ Slice notation: start:stop:step            │
│      # s[::-1] means "start from end, go backward"  │
│      # This creates a new reversed string           │
│                                                     │
│  Alternative approach:                              │
│  def reverse_string(s):                             │
│      return ''.join(reversed(s))                    │
│      # reversed() returns an iterator              │
│      # ''.join() converts it back to a string      │
│                                                     │
│                              [Next Question →]      │
└────────────────────────────────────────────────────┘
```

**Implementation priority:** This feature is the core learning value of practice mode. Without it, practice mode is just "try and check" — with it, it becomes a guided learning experience. Prioritize building the explanation display first (using existing `explanation` + `solution_code` fields), then gradually enrich the question bank with `common_mistakes` data over time.

---

## 6. Question Bank Architecture

### Structure

```
lib/question-bank/
├── index.ts              # Aggregation + exports
├── types.ts              # TypeScript type definitions
├── test-builder.ts       # Test assembly logic
└── questions/
    ├── strings.ts        # 20 questions
    ├── lists.ts          # 17 questions
    ├── loops.ts          # ~20 questions
    ├── tuples.ts         # ~15 questions
    ├── sorting.ts        # ~9 questions
    └── dictionaries.ts   # 14 questions
```

**Total: ~88 questions across 6 topics**

### Type Definitions

```typescript
type QuestionType = "mc" | "open" | "coding";
type Difficulty = "beginner" | "intermediate" | "advanced";
type ExerciseType = "fill_blank" | "write_from_scratch" | "fix_bug" | "predict_output";

interface BankQuestion {
  id: string;                    // Unique identifier (e.g., "str_mc_001")
  topic: string;                 // Topic category
  type: QuestionType;            // MC, open answer, or coding
  difficulty: Difficulty;
  question: string;              // Question text / prompt
  options?: string[];            // MC only: 4 answer options
  correct_index?: number;        // MC only: 0-3
  acceptable_answers?: string[]; // Open answer: valid responses
  starter_code?: string;         // Coding: initial code template
  solution_code?: string;        // Coding: reference solution
  test_cases?: TestCase[];       // Coding: automated test cases
  exercise_type?: ExerciseType;  // Coding: sub-type
  hints?: string[];              // Coding: progressive hints
  explanation?: string;          // Shown after grading
}

interface TestCase {
  input: string;
  expected_output: string;
}
```

### Test Builder Logic

The test builder (`test-builder.ts`) accepts a configuration object and returns a curated set of questions:

```typescript
interface TestConfig {
  topics: string[];
  difficulties: Difficulty[];
  questionTypes: QuestionType[];
  counts: { mc?: number; open?: number; coding?: number };
  // OR manual selection:
  selectedQuestionIds?: string[];
}
```

**Auto mode**: Filters the question bank by topic/difficulty/type, then randomly selects up to the requested count. Validates that requested count does not exceed available questions.

**Manual mode**: Looks up specific question IDs from the bank. Returns error if any ID is not found.

---

## 7. Data Model

### Entity Relationship

```
profiles (future)
    │
    ├── 1:N → tests (created_by)
    │           │
    │           ├── 1:N → recipient_test_assignments
    │           │           │
    │           │           └── 1:1 → test_attempts
    │           │
    │           └── questions embedded in questions_json
    │
    └── 1:N → recipients
                │
                └── 1:N → recipient_test_assignments
```

### Schema

```sql
-- Tests
-- Stores test metadata and questions as JSON (denormalized for simplicity)
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  config_json JSONB,                  -- TestConfig used to build the test
  questions_json JSONB NOT NULL,      -- Array of BankQuestion objects
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  pass_threshold REAL DEFAULT 70,     -- Percentage to pass
  status TEXT DEFAULT 'draft'         -- 'draft' | 'published'
    CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipients
-- Tracks test takers (created on link generation or OAuth sign-in)
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments
-- Links a recipient to a test via a unique access token
CREATE TABLE recipient_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES recipients(id),  -- nullable until auth
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'invited', 'started', 'completed', 'timed_out')),
  access_token VARCHAR(255) UNIQUE NOT NULL,
  due_date TIMESTAMPTZ,
  custom_message TEXT,
  invited_email TEXT,               -- Email entered at link generation
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score REAL
);

-- Test Attempts
-- Records a completed test submission with graded answers
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES recipients(id),
  assignment_id UUID REFERENCES recipient_test_assignments(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_secs INTEGER,
  total_questions INTEGER,
  correct_answers INTEGER,
  score_percentage REAL,
  passed BOOLEAN,
  answers JSONB                     -- Array of GradedAnswer objects
);
```

### GradedAnswer JSON Structure

```typescript
interface GradedAnswer {
  question_id: string;
  question_type: "mc" | "open" | "coding";
  selected_index?: number;          // MC
  text_answer?: string;             // Open answer
  code_answer?: string;             // Coding
  is_correct: boolean;
  correct_answer?: string;          // For review display
  explanation?: string;
}
```

### Row-Level Security (RLS) Policies

| Table | Policy | Rule |
|-------|--------|------|
| `tests` | Admin write | Service role key required for INSERT/UPDATE/DELETE |
| `tests` | Public read | Authenticated users can SELECT published tests |
| `recipients` | Service write | Service role for INSERT/UPDATE |
| `recipients` | Self read | Users can read own record |
| `recipient_test_assignments` | Service write | Service role for INSERT/UPDATE |
| `recipient_test_assignments` | Token read | SELECT where `access_token` matches |
| `test_attempts` | Service write | Service role for INSERT |
| `test_attempts` | Admin read | Authenticated admins can SELECT all |
| `test_attempts` | Self read | Users can read own attempts |

### Indexes (Recommended for Production)

```sql
CREATE INDEX idx_assignments_token ON recipient_test_assignments(access_token);
CREATE INDEX idx_assignments_test_id ON recipient_test_assignments(test_id);
CREATE INDEX idx_attempts_test_id ON test_attempts(test_id);
CREATE INDEX idx_attempts_recipient_id ON test_attempts(recipient_id);
CREATE INDEX idx_recipients_email ON recipients(email);
```

---

## 8. API Reference

### Test Management (Admin)

#### `GET /api/tests`
Returns all tests ordered by creation date.
- **Auth**: Service role (admin)
- **Response**: `{ tests: Test[] }`

#### `POST /api/tests`
Creates a new test from config + question selection.
- **Auth**: Service role (admin)
- **Body**: `{ name, config_json, questions_json, duration_minutes, total_questions, pass_threshold, status }`
- **Response**: `{ test: Test }`

#### `GET /api/tests/[testId]`
Returns a single test with full question data.
- **Auth**: Service role (admin)
- **Response**: `{ test: Test }`

#### `PATCH /api/tests/[testId]`
Updates test fields (name, status, questions, etc.).
- **Auth**: Service role (admin)
- **Body**: Partial test fields
- **Response**: `{ test: Test }`

#### `DELETE /api/tests/[testId]`
Deletes a test and cascading assignments/attempts.
- **Auth**: Service role (admin)
- **Response**: `{ success: true }`

### Assignment Management (Admin)

#### `GET /api/tests/[testId]/assignments`
Lists all assignments for a test.
- **Auth**: Service role (admin)
- **Response**: `{ assignments: Assignment[] }`

#### `POST /api/tests/[testId]/generate-link`
Generates a magic link for a new assignment.
- **Auth**: Service role (admin)
- **Body**: `{ email?, due_date?, custom_message? }`
- **Response**: `{ assignment_id, access_token, link, test_name, email }`
- **Note**: `email` is stored as `invited_email` on the assignment for admin tracking

### Test Taking (Public)

#### `GET /api/take-test/[testId]?token={accessToken}`
Validates token, returns test data for the taker. Marks assignment as "started".
- **Auth**: Token in query string
- **Validation**: Token must exist, assignment must not be completed
- **Response**: `{ test: Test, assignment: Assignment }` (questions included, correct answers stripped)

#### `POST /api/take-test/[testId]?token={accessToken}`
Submits answers, grades the test, stores results.
- **Auth**: Token in query string
- **Body**: `{ answers: SubmittedAnswer[], time_spent_secs: number, recipient_id?: string }`
- **Grading logic**:
  - MC: `selected_index === correct_index`
  - Open: case-insensitive match against `acceptable_answers[]`
  - Coding: graded client-side via Pyodide test cases (result passed to server)
- **Response**: `{ attempt: TestAttempt }` (includes graded answers with explanations)

### Admin Analytics

#### `GET /api/admin/results?testId={testId}`
Returns all test attempts for a specific test.
- **Auth**: Service role (admin)
- **Response**: `{ attempts: TestAttempt[] }`

#### `GET /api/admin/stats?testId={testId}`
Returns aggregate statistics for a test.
- **Auth**: Service role (admin)
- **Response**: `{ total_attempts, avg_score, pass_rate, per_question_accuracy: { [questionId]: number } }`

#### `GET /api/admin/export?testId={testId}`
Exports results as CSV.
- **Auth**: Service role (admin)
- **Response**: CSV file download (Content-Type: text/csv)

---

## 9. Tech Stack & Architecture

### Stack Summary

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 15.x | App Router, API routes, SSR/SSG |
| UI Library | React | 19.x | Component rendering |
| Language | TypeScript | 5.8 | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Icons | Lucide React | 0.546 | Icon set |
| Animations | Motion (Framer) | 12.x | UI animations |
| Auth & DB | Supabase | 2.49 | PostgreSQL, Auth, RLS, real-time |
| Python Exec | Pyodide | 0.26.4 | WebAssembly Python in browser |
| AI (Future) | Google GenAI | 1.29 | Question generation (Phase 2) |
| Hosting | Dokploy | — | Self-hosted deployment |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                     Client (Browser)                 │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Admin    │  │ Test     │  │ Practice Mode     │  │
│  │ Dashboard│  │ Taking   │  │ (Pyodide Engine)  │  │
│  └────┬─────┘  └────┬─────┘  └───────────────────┘  │
│       │              │                                │
│       │    React 19 + Next.js 15 App Router          │
└───────┼──────────────┼───────────────────────────────┘
        │              │
        ▼              ▼
┌─────────────────────────────────────┐
│         Next.js API Routes          │
│  /api/tests/*                       │
│  /api/take-test/*                   │
│  /api/admin/*                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│           Supabase                  │
│  ┌───────────┐  ┌───────────────┐  │
│  │ PostgreSQL│  │ Auth (OAuth)  │  │
│  │ + RLS     │  │ Google SSO    │  │
│  └───────────┘  └───────────────┘  │
└─────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Questions stored as JSON in tests table** (denormalized): Simplifies reads and avoids JOINs at test-taking time. Trade-off: harder to update individual questions across tests.

2. **Pyodide for Python execution** (client-side): No server-side sandbox needed. Code runs entirely in the browser. Trade-off: ~3-5s initial load for the Pyodide WASM bundle, large bundle size (~20MB).

3. **Token-based access** (no auth required for takers): Reduces friction for learners. Trade-off: tokens must be kept secret; anyone with the link can take the test.

4. **Service role key for admin routes**: All admin API routes use the Supabase service role key, bypassing RLS. Trade-off: no per-user admin permission granularity (see Security section).

---

## 10. Frontend Architecture

### Page Routing

```
app/
├── page.tsx                        # Main portal (admin dashboard + practice mode)
├── layout.tsx                      # Root layout (HTML shell, global CSS)
├── globals.css                     # Tailwind + custom styles
├── practice-view.tsx               # Practice mode component
└── take-test/
    └── [testId]/
        ├── page.tsx                # Server component (loads test ID)
        └── client.tsx              # Client component (auth + test-taking UI)
```

### Component Hierarchy

```
Layout
├── MainPage (/)
│   ├── AdminDashboard
│   │   ├── TestList
│   │   ├── TestBuilder
│   │   ├── AssignmentManager
│   │   └── ResultsViewer
│   └── PracticeView
│       ├── FilterControls
│       ├── CodeEditor
│       ├── TestCaseRunner (Pyodide)
│       └── HintDisplay
│
└── TakeTestPage (/take-test/[id])
    └── TakeTestClient
        ├── AuthPrompt (optional OAuth)
        ├── TestTakingView
        │   ├── Timer
        │   ├── ProgressBar
        │   ├── TakerMCQuestion
        │   ├── TakerOpenQuestion
        │   ├── TakerCodingQuestion (Pyodide)
        │   └── SubmitConfirmation
        └── ResultsView
            ├── ScoreSummary
            └── QuestionReview
```

### Design System

The UI uses a "brutal" design aesthetic — bold borders, high contrast, strong typography. Key patterns:

- **Cards**: Heavy border (2-3px), slight shadow, white background
- **Buttons**: Solid fills, clear hover states, large touch targets (min 44px)
- **Status badges**: Color-coded (gray=draft, blue=published, green=pass, red=fail)
- **Code editor**: Monospace font, dark theme, adequate line height
- **Progress bar**: Top of screen during test taking, clickable for direct navigation

### Pyodide Integration

```typescript
// lib/hooks/use-pyodide.ts
// Custom hook managing Pyodide lifecycle:
// 1. Lazy-loads Pyodide from CDN on first coding question
// 2. Initializes Python runtime
// 3. Provides runPython(code) function
// 4. Handles stdout/stderr capture for test case comparison
// 5. Manages loading state for UI feedback
```

**CDN source**: `https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js`

**Important**: Pyodide loads a ~20MB WASM bundle. This should be lazy-loaded only when a coding question is encountered, not on page load.

---

## 11. Deployment Guide (Dokploy)

### Prerequisites

- Dokploy instance running and accessible
- Domain configured with SSL (Let's Encrypt via Dokploy)
- Supabase project provisioned (cloud or self-hosted)
- Node.js 18+ build environment

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # Public anon key (safe for client)
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # Service role key (SERVER ONLY)

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com  # Production URL (used for magic links)
NODE_ENV=production

# Optional: Google GenAI (Phase 2)
# GEMINI_API_KEY=your-key
```

### Dokploy Configuration

#### Option A: Docker Deployment (Recommended)

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Update `next.config.ts` for standalone output:

```typescript
const nextConfig = {
  output: 'standalone',
};
export default nextConfig;
```

**Dokploy steps:**
1. Create a new Application in Dokploy
2. Connect your Git repository (or upload Docker image)
3. Set build type to "Dockerfile"
4. Add all environment variables in the Environment tab
5. Configure domain and SSL in the Domain tab
6. Set port to 3000
7. Deploy

#### Option B: Nixpacks / Buildpacks

Dokploy supports Nixpacks auto-detection for Next.js projects. If using this:
1. Set build type to "Nixpacks"
2. Ensure `npm run build` works locally
3. Set the start command to `npm start`
4. Configure environment variables

### Post-Deployment Checklist

- [ ] Verify `NEXT_PUBLIC_APP_URL` points to production domain (magic links depend on this)
- [ ] Run Supabase migrations against production database
- [ ] Verify RLS policies are active on all tables
- [ ] Test Google OAuth callback URL is registered in Supabase (must match production domain)
- [ ] Test magic link generation and test-taking flow end to end
- [ ] Verify Pyodide CDN loads (check for CORS issues)
- [ ] Set up health check endpoint for Dokploy monitoring
- [ ] Configure resource limits (recommended: 512MB RAM minimum for Next.js)

### Database Migrations

Apply migrations to your Supabase project:

```bash
# From project root
supabase db push
# Or manually run SQL files in supabase/migrations/ via the Supabase SQL editor
```

---

## 12. Security & Auth Hardening

### Current State & Required Improvements

#### Priority 1: Critical (Before Production)

| Issue | Current State | Required Fix |
|-------|---------------|--------------|
| Admin role enforcement | Service role key used for all admin routes | Add `profiles` table with `role` column; verify role in API middleware |
| Token entropy | Uses `crypto.randomUUID()` or similar | Ensure tokens are at least 32 bytes of cryptographic randomness |
| Rate limiting | None | Add rate limiting on token validation endpoint to prevent brute-force |
| CORS configuration | Default Next.js | Restrict API routes to your domain only |
| Service key exposure | Used in API routes | Verify `SUPABASE_SERVICE_ROLE_KEY` is never sent to the client bundle |

#### Priority 2: Important (Early Production)

| Issue | Recommendation |
|-------|----------------|
| API input validation | Add schema validation (Zod) on all API request bodies |
| Token expiry | Add `expires_at` column to assignments; reject expired tokens |
| Brute-force protection | Rate limit `/api/take-test/[id]` to 10 requests/minute per IP |
| CSRF protection | Next.js handles this for server actions; verify for API routes |
| Content Security Policy | Add CSP headers allowing Pyodide CDN + Supabase domain |
| SQL injection | Supabase client parameterizes queries; audit any raw SQL |

#### Priority 3: Recommended (Mature Production)

| Issue | Recommendation |
|-------|----------------|
| Audit logging | Log admin actions (test creation, link generation, deletions) |
| IP-based access control | Optional: restrict admin routes to known IPs |
| Token single-use enforcement | Currently assignment status prevents reuse; add explicit revocation |
| Session timeout | Configure Supabase auth session expiry (default: 1 hour) |
| Dependency scanning | Add `npm audit` to CI pipeline |

### Recommended Auth Middleware

```typescript
// lib/auth-middleware.ts
import { createClient } from '@supabase/supabase-js';

export async function requireAdmin(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Extract user from session/token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) throw new Error('Unauthorized');

  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  if (error || !user) throw new Error('Unauthorized');

  // Check role in profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Forbidden');

  return user;
}
```

### Content Security Policy Headers

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net",  // Pyodide
      "worker-src 'self' blob:",                                     // Pyodide workers
      "connect-src 'self' https://*.supabase.co https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
    ].join('; ')
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];
```

---

## 13. Performance & Scale

### Current Bottlenecks

| Bottleneck | Impact | Mitigation |
|------------|--------|------------|
| Pyodide WASM load (~20MB) | 3-8s first load on coding questions | Lazy-load only for coding questions; add loading spinner; consider service worker caching |
| Questions stored as JSON blob | Reads are fast but updates are full-row rewrites | Acceptable at current scale (<1000 tests); normalize if needed later |
| No server-side caching | Every API call hits Supabase | Add in-memory cache for test data (tests rarely change during a session) |
| No CDN for static assets | Slower global delivery | Configure Dokploy with a CDN or use Next.js static export for non-dynamic pages |

### Optimization Strategies

#### Client-Side

1. **Pyodide preloading**: When a test contains coding questions, begin loading Pyodide during the intro/start screen, not when the first coding question appears.

2. **Service Worker caching**: Cache the Pyodide WASM bundle after first load. Subsequent visits load from cache.

```typescript
// In a service worker or via next/script
if ('serviceWorker' in navigator) {
  // Cache Pyodide bundle for offline/fast reload
  caches.open('pyodide-v0.26.4').then(cache => {
    cache.add('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
  });
}
```

3. **Code splitting**: Ensure the admin dashboard and test-taking views are in separate chunks. Practice mode should also be its own chunk.

4. **Image/asset optimization**: Use Next.js `<Image>` component for any images; compress static assets.

#### Server-Side

1. **Database indexes**: Apply the indexes listed in the Data Model section. Critical for token lookups and results queries.

2. **Connection pooling**: Supabase handles this, but verify connection limits match your Dokploy plan.

3. **API response caching**: For admin stats endpoints, cache results for 30 seconds (stats don't need real-time precision).

```typescript
// Cache headers for stats endpoint
export async function GET(request: Request) {
  // ... fetch stats
  return new Response(JSON.stringify(stats), {
    headers: {
      'Cache-Control': 'private, max-age=30',
      'Content-Type': 'application/json',
    },
  });
}
```

4. **Payload size**: Strip `correct_index`, `acceptable_answers`, `solution_code`, and `explanation` from test data sent to takers. Only include them in the results response after submission.

### Scale Estimates

| Scenario | Concurrent Users | Bottleneck | Recommendation |
|----------|-----------------|------------|----------------|
| Classroom (30 students) | 30 | None expected | Default config sufficient |
| Bootcamp (100 students) | 50-100 | Supabase connection limits | Verify Supabase plan supports concurrent connections |
| Organization (500+) | 100-200 | Dokploy resources, Supabase | Scale Dokploy container, upgrade Supabase plan |

### Monitoring Recommendations

- **Uptime monitoring**: Use Dokploy health checks or external service (e.g., UptimeRobot)
- **Error tracking**: Add Sentry or similar for client + server error capture
- **Performance**: Lighthouse CI in build pipeline; target >90 performance score
- **Database**: Monitor Supabase dashboard for slow queries and connection usage

---

## 14. Phase 2 Roadmap

### Phase 2A: AI-Powered Question Generation

| Feature | Description | Priority |
|---------|-------------|----------|
| Gemini integration | Generate questions from topic + difficulty + type parameters | High |
| Admin review workflow | AI generates draft questions; admin approves/edits before adding to bank | High |
| Question bank expansion | Grow from ~88 to 500+ questions across more topics | Medium |
| Adaptive difficulty | Generate questions calibrated to learner's previous performance | Low |

**Technical approach**: The `@google/genai` dependency is already installed. Build a `/api/generate-questions` endpoint that:
1. Accepts topic, difficulty, type, count parameters
2. Calls Gemini with a structured prompt including few-shot examples from existing bank
3. Returns generated questions in `BankQuestion` format
4. Admin reviews in a preview UI before committing to the question bank

### Phase 2B: Enhanced Assessment Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Email notifications | Send magic links via email (SendGrid/Resend) | High |
| Test scheduling | Set open/close dates for tests | Medium |
| Retake policy | Configure allowed retakes per test | Medium |
| Question randomization | Randomize question order per learner | Medium |
| Partial credit | Weighted scoring for coding questions (partial test case passes) | Low |
| Code execution server-side | Move grading to server for tamper resistance | Low |

### Phase 2C: Learner Experience

| Feature | Description | Priority |
|---------|-------------|----------|
| Learner dashboard | Personal history, scores over time, strengths/weaknesses | High |
| Leaderboard | Optional gamification for practice mode | Low |
| Progress tracking | Topic mastery visualization | Medium |
| Bookmarking | Save practice questions for later | Low |

### Phase 2D: Platform Maturity

| Feature | Description | Priority |
|---------|-------------|----------|
| Multi-language support | i18n for UI text | Low |
| ~~Proctoring~~ | ~~Browser lock-down, tab-switch detection~~ | Moved to Phase 1 — see Section 5.4.1 |
| Question bank import/export | CSV/JSON import of question sets | Medium |
| API for external integration | Public API for LMS integration | Low |
| Advanced analytics | Score trends, cohort comparison, difficulty calibration | Medium |

---

## 15. Open Questions & Decisions

### Resolved

- [x] ~~Should learners need accounts?~~ → No, token-based access is primary. OAuth is optional.
- [x] ~~n8n for question generation?~~ → No. Using curated question bank (Phase 1) and Gemini API (Phase 2).
- [x] ~~How to execute Python code?~~ → Pyodide (client-side WebAssembly).

### Open

- [ ] **Retake policy**: Should learners be able to retake a test? If so, how many attempts? Does the admin configure this per test?
- [ ] **Coding question grading trust**: Currently grading happens client-side (Pyodide). A savvy learner could manipulate results. Should we add server-side re-grading for coding questions?
- [ ] **Admin authentication model**: Currently any request with the service role key is "admin." Should we build a proper admin user system with the profiles table before launch?
- [ ] **Question bank versioning**: If a question is edited after being used in a test, should historical tests retain the original version? (Currently yes — questions are copied into `questions_json`.)
- [ ] **Scaling Pyodide**: For large classrooms, should we host Pyodide assets ourselves (on the same Dokploy instance) instead of relying on the jsDelivr CDN?
- [ ] **Offline support**: Should the test-taking experience work offline (service worker + local answer storage)?
- [ ] **Accessibility audit**: Has the test-taking UI been tested with screen readers and keyboard-only navigation?

---

*This PRD is a living document. Update as scope evolves and Phase 2 features are implemented.*
