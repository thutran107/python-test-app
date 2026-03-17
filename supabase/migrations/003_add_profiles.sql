-- ============================================================
-- Profiles table: stores user email and role (admin / taker)
-- Pre-populate rows to assign roles before users sign up.
-- ============================================================

CREATE TABLE profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email      TEXT PRIMARY KEY,
  role       TEXT NOT NULL DEFAULT 'taker',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- When a new user signs up via auth, link them to an existing
-- profile (if pre-created by an admin) or create a new taker row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'taker')
  ON CONFLICT (email) DO UPDATE SET id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
