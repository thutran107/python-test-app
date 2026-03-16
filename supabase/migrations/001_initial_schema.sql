-- ============================================================
-- PyTest Assessment Platform — Initial Schema
-- ============================================================

-- Tests table: stores created test definitions
CREATE TABLE tests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  config_json     JSONB NOT NULL,
  questions_json  JSONB NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  pass_threshold  REAL DEFAULT 70,
  status          TEXT NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Recipients table: test takers (created after Google OAuth)
CREATE TABLE recipients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Assignments: links a recipient to a test via access token
CREATE TABLE recipient_test_assignments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id      UUID REFERENCES recipients(id),
  test_id           UUID NOT NULL REFERENCES tests(id),
  status            TEXT NOT NULL DEFAULT 'pending',
  access_token      VARCHAR(255) NOT NULL UNIQUE,
  due_date          TIMESTAMPTZ,
  custom_message    TEXT,
  notification_sent BOOLEAN DEFAULT false,
  assigned_at       TIMESTAMPTZ DEFAULT now(),
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  score             REAL
);

CREATE INDEX idx_assignments_token ON recipient_test_assignments(access_token);
CREATE INDEX idx_assignments_test ON recipient_test_assignments(test_id);

-- Test attempts: one taker's completed attempt
CREATE TABLE test_attempts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id           UUID NOT NULL REFERENCES tests(id),
  recipient_id      UUID NOT NULL REFERENCES recipients(id),
  assignment_id     UUID NOT NULL REFERENCES recipient_test_assignments(id),
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  time_spent_secs   INTEGER,
  total_questions   INTEGER NOT NULL,
  correct_answers   INTEGER NOT NULL DEFAULT 0,
  score_percentage  REAL NOT NULL DEFAULT 0,
  passed            BOOLEAN NOT NULL DEFAULT false,
  answers           JSONB NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_attempts_test ON test_attempts(test_id);
CREATE INDEX idx_attempts_recipient ON test_attempts(recipient_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipient_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

-- Tests: anyone can read published tests
CREATE POLICY "Anyone can read published tests"
  ON tests FOR SELECT
  USING (status = 'published');

CREATE POLICY "Service role full access on tests"
  ON tests FOR ALL
  USING (auth.role() = 'service_role');

-- Recipients: service role only
CREATE POLICY "Service role full access on recipients"
  ON recipients FOR ALL
  USING (auth.role() = 'service_role');

-- Assignments: service role for writes, authenticated users can read own
CREATE POLICY "Service role full access on assignments"
  ON recipient_test_assignments FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users read own assignments"
  ON recipient_test_assignments FOR SELECT
  USING (
    recipient_id IN (
      SELECT id FROM recipients WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Test attempts: service role for writes, authenticated users read own
CREATE POLICY "Service role full access on attempts"
  ON test_attempts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users read own attempts"
  ON test_attempts FOR SELECT
  USING (
    recipient_id IN (
      SELECT id FROM recipients WHERE email = auth.jwt() ->> 'email'
    )
  );
