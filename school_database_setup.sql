-- ═══════════════════════════════════════════════════════════════
--  SCHOOL WEBSITE — SUPABASE DATABASE SCHEMA
--  Project: owojgzrzstigmumsehdw
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── 0. DB SNAPSHOT (primary app storage) ────────────────────────
-- The website reads/writes the entire DB as one JSON blob here.
-- The normalized tables below are available for advanced queries.
CREATE TABLE IF NOT EXISTS db_snapshot (
  id         INTEGER PRIMARY KEY,
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE db_snapshot ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon all db_snapshot" ON db_snapshot;
DROP POLICY IF EXISTS "Authenticated db_snapshot" ON db_snapshot;
DROP POLICY IF EXISTS "Authenticated read db_snapshot" ON db_snapshot;
DROP POLICY IF EXISTS "Authenticated write db_snapshot" ON db_snapshot;

-- Allow all authenticated users to read the snapshot to load the dashboard
CREATE POLICY "Authenticated read db_snapshot" ON db_snapshot
  FOR SELECT TO authenticated
  USING (true);

-- Restrict updating/inserting the db_snapshot to admins and teachers ONLY
CREATE POLICY "Authenticated write db_snapshot" ON db_snapshot
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'teacher')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'teacher')
    )
  );


-- ── PUBLIC WEBSITE BRANDING (safe public landing data only) ─────
-- Public visitors can read logo/slides/contact branding without exposing portal/student data.
CREATE TABLE IF NOT EXISTS site_public (
  id         INTEGER PRIMARY KEY,
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_public ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read site_public" ON site_public;
DROP POLICY IF EXISTS "Authenticated write site_public" ON site_public;
CREATE POLICY "Public read site_public" ON site_public
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "Authenticated write site_public" ON site_public
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
GRANT SELECT ON site_public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON site_public TO authenticated;

-- ── 1. SCHOOL SETTINGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_settings (
  id            SERIAL PRIMARY KEY,
  name          TEXT    NOT NULL DEFAULT 'EduNova School',
  tagline       TEXT    DEFAULT 'Playful learning, powerful management',
  logo          TEXT    DEFAULT '',
  address       TEXT    DEFAULT '',
  city          TEXT    DEFAULT 'Karachi',
  phone         TEXT    DEFAULT '',
  email         TEXT    DEFAULT '',
  principal     TEXT    DEFAULT '',
  primary_color TEXT    DEFAULT '#ff8a00',
  founded       TEXT    DEFAULT '',
  motto         TEXT    DEFAULT '',
  website       TEXT    DEFAULT '',
  hero_text     TEXT    DEFAULT 'A friendlier school website with complete management tools.',
  currency      TEXT    DEFAULT 'PKR',
  school_year   TEXT    DEFAULT '2025-26',
  theme         TEXT    DEFAULT 'light',
  default_fee_due_day TEXT DEFAULT '5th of month',
  late_after    TEXT    DEFAULT '08:00',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default school settings
INSERT INTO school_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ── 2. USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY DEFAULT ('u' || gen_random_uuid()::text),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  auth_user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  role            TEXT NOT NULL CHECK (role IN ('admin','teacher','student','parent')),
  photo           TEXT DEFAULT '',
  phone           TEXT DEFAULT '',
  -- teacher-specific
  subject         TEXT DEFAULT '',
  class_ids       TEXT[] DEFAULT '{}',
  salary          NUMERIC DEFAULT 0,
  bonus           NUMERIC DEFAULT 0,
  deductions      NUMERIC DEFAULT 0,
  payroll_status  TEXT DEFAULT 'pending',
  last_paid       TEXT DEFAULT '',
  join_date       TEXT DEFAULT '',
  notes           TEXT DEFAULT '',
  -- student-specific
  class_id        TEXT DEFAULT '',
  -- parent-specific
  family_id       TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- Migration for existing projects created before Supabase Auth hardening.
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Default portal profiles. Create matching login accounts in Supabase Auth.
-- Default users
INSERT INTO users (id, name, email, role) VALUES
  ('u1', 'School Admin',   'admin@school.edu',   'admin'),
  ('u2', 'Ms. Sana Malik', 'teacher@school.edu', 'teacher'),
  ('u3', 'Ahmed Raza',     'student@school.edu', 'student'),
  ('u4', 'Mr. Raza Sr.',   'parent@school.edu',  'parent')
ON CONFLICT (id) DO NOTHING;

UPDATE users SET subject='Mathematics', class_ids=ARRAY['c6','c7'], salary=45000, bonus=3000, join_date='2025-01-10', notes='Senior mathematics teacher' WHERE id='u2';
UPDATE users SET class_id='c9' WHERE id='u3';
UPDATE users SET family_id='fam1' WHERE id='u4';

-- ── 3. CLASSES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  section   TEXT DEFAULT 'A',
  level     TEXT DEFAULT 'primary',
  capacity  INTEGER DEFAULT 35,
  teacher   TEXT DEFAULT ''
);

INSERT INTO classes (id, name, section, level, capacity) VALUES
  ('c1',  'Class 1',  'A', 'primary',   35),
  ('c2',  'Class 2',  'A', 'primary',   35),
  ('c3',  'Class 3',  'A', 'primary',   35),
  ('c4',  'Class 4',  'A', 'primary',   35),
  ('c5',  'Class 5',  'A', 'primary',   35),
  ('c6',  'Class 6',  'A', 'secondary', 40),
  ('c7',  'Class 7',  'A', 'secondary', 40),
  ('c8',  'Class 8',  'A', 'secondary', 40),
  ('c9',  'Class 9',  'A', 'secondary', 40),
  ('c10', 'Class 10', 'A', 'secondary', 40)
ON CONFLICT (id) DO NOTHING;

-- ── 4. SUBJECTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  code  TEXT NOT NULL,
  icon  TEXT DEFAULT '📚',
  color TEXT DEFAULT '#2563eb'
);

INSERT INTO subjects (id, name, code, icon, color) VALUES
  ('s1', 'Mathematics',  'MATH', '📐', '#2563eb'),
  ('s2', 'Science',      'SCI',  '🔬', '#0891b2'),
  ('s3', 'English',      'ENG',  '📖', '#059669'),
  ('s4', 'Urdu',         'URD',  '📝', '#7c3aed'),
  ('s5', 'Islamiyat',    'ISL',  '🕌', '#065f46'),
  ('s6', 'Social Studies','SS',  '🌍', '#b45309'),
  ('s7', 'Computer',     'CS',   '💻', '#db2777'),
  ('s8', 'Pak. Studies', 'PS',   '🇵🇰', '#166534')
ON CONFLICT (id) DO NOTHING;

-- ── 5. STUDENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id           TEXT PRIMARY KEY DEFAULT ('s' || gen_random_uuid()::text),
  class_id     TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  roll         TEXT DEFAULT '',
  photo        TEXT DEFAULT '',
  dob          TEXT DEFAULT '',
  blood        TEXT DEFAULT '',
  gender       TEXT DEFAULT '',
  phone        TEXT DEFAULT '',
  address      TEXT DEFAULT '',
  parent_name  TEXT DEFAULT '',
  parent_phone TEXT DEFAULT '',
  whatsapp     TEXT DEFAULT '',
  attendance   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. STUDENT ATTENDANCE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id         BIGSERIAL PRIMARY KEY,
  class_id   TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  status     TEXT NOT NULL DEFAULT 'A' CHECK (status IN ('P','A','L')),
  UNIQUE (class_id, student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_class_date  ON attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student      ON attendance(student_id);

-- ── 7. TEACHER ATTENDANCE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  check_in   TEXT DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'Absent' CHECK (status IN ('Present','Late','Absent','Leave')),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_teacher_att_user_date ON teacher_attendance(user_id, date);

-- ── 8. FEE ITEMS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fee_items (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  amount    NUMERIC NOT NULL DEFAULT 0,
  due       TEXT DEFAULT '',
  mandatory BOOLEAN DEFAULT TRUE,
  type      TEXT DEFAULT 'monthly'
);

INSERT INTO fee_items (id, name, amount, due, mandatory, type) VALUES
  ('f1', 'Monthly Tuition',    5000,  '5th of month', TRUE,  'monthly'),
  ('f2', 'Annual Fund',        10000, 'Jan 10',        TRUE,  'annual'),
  ('f3', 'Exam Fee',           2000,  'Nov 15',         TRUE,  'exam'),
  ('f4', 'Transport',          2500,  '5th of month', FALSE, 'monthly'),
  ('f5', 'Books & Stationery', 3000,  'Jan',           FALSE, 'annual')
ON CONFLICT (id) DO NOTHING;

-- ── 9. FEE PAYMENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fee_payments (
  id         BIGSERIAL PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_item_id TEXT NOT NULL REFERENCES fee_items(id) ON DELETE CASCADE,
  paid       BOOLEAN DEFAULT FALSE,
  paid_date  DATE,
  amount     NUMERIC DEFAULT 0,
  receipt_no TEXT DEFAULT '',
  notes      TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, fee_item_id)
);

CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);

-- ── 10. GRADES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grades (
  id         BIGSERIAL PRIMARY KEY,
  class_id   TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  score      NUMERIC DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  exam_id    TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, student_id, subject_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_class   ON grades(class_id);

-- ── 11. EXAMS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
  id         TEXT PRIMARY KEY DEFAULT ('e' || gen_random_uuid()::text),
  name       TEXT NOT NULL,
  class_id   TEXT REFERENCES classes(id) ON DELETE SET NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  date       DATE,
  total      NUMERIC DEFAULT 100,
  notes      TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 12. NOTICES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id         TEXT PRIMARY KEY DEFAULT ('n' || gen_random_uuid()::text),
  title      TEXT NOT NULL,
  body       TEXT DEFAULT '',
  date       DATE DEFAULT CURRENT_DATE,
  author     TEXT DEFAULT '',
  pinned     BOOLEAN DEFAULT FALSE,
  audience   TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 13. TIMETABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timetable (
  id         BIGSERIAL PRIMARY KEY,
  class_id   TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  day        TEXT NOT NULL CHECK (day IN ('Mon','Tue','Wed','Thu','Fri','Sat')),
  period     INTEGER NOT NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  start_time TEXT DEFAULT '',
  end_time   TEXT DEFAULT '',
  room       TEXT DEFAULT '',
  UNIQUE (class_id, day, period)
);

CREATE INDEX IF NOT EXISTS idx_timetable_class ON timetable(class_id);

-- ── 14. FAMILIES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS families (
  id           TEXT PRIMARY KEY,
  parent_name  TEXT NOT NULL,
  phone        TEXT DEFAULT '',
  email        TEXT DEFAULT '',
  address      TEXT DEFAULT '',
  whatsapp     TEXT DEFAULT '',
  student_ids  TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO families (id, parent_name, phone, email, whatsapp) VALUES
  ('fam1', 'Raza Family', '03001234567', 'parent@school.edu', '923001234567')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS) — authenticated users only
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE school_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance       ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades           ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable        ENABLE ROW LEVEL SECURITY;
ALTER TABLE families         ENABLE ROW LEVEL SECURITY;

-- Remove earlier public/anon policies if this script is re-run over an older database.
DROP POLICY IF EXISTS "Public read school_settings"  ON school_settings;
DROP POLICY IF EXISTS "Public read classes"          ON classes;
DROP POLICY IF EXISTS "Public read subjects"         ON subjects;
DROP POLICY IF EXISTS "Public read notices"          ON notices;
DROP POLICY IF EXISTS "Public read fee_items"        ON fee_items;
DROP POLICY IF EXISTS "Anon all users"               ON users;
DROP POLICY IF EXISTS "Anon all students"            ON students;
DROP POLICY IF EXISTS "Anon all attendance"          ON attendance;
DROP POLICY IF EXISTS "Anon all teacher_attendance"  ON teacher_attendance;
DROP POLICY IF EXISTS "Anon all fee_payments"        ON fee_payments;
DROP POLICY IF EXISTS "Anon all grades"              ON grades;
DROP POLICY IF EXISTS "Anon all exams"               ON exams;
DROP POLICY IF EXISTS "Anon all timetable"           ON timetable;
DROP POLICY IF EXISTS "Anon all families"            ON families;
DROP POLICY IF EXISTS "Anon write school_settings"   ON school_settings;

DROP POLICY IF EXISTS "Authenticated school_settings" ON school_settings;
DROP POLICY IF EXISTS "Authenticated users" ON users;
DROP POLICY IF EXISTS "Authenticated classes" ON classes;
DROP POLICY IF EXISTS "Authenticated subjects" ON subjects;
DROP POLICY IF EXISTS "Authenticated students" ON students;
DROP POLICY IF EXISTS "Authenticated attendance" ON attendance;
DROP POLICY IF EXISTS "Authenticated teacher_attendance" ON teacher_attendance;
DROP POLICY IF EXISTS "Authenticated fee_items" ON fee_items;
DROP POLICY IF EXISTS "Authenticated fee_payments" ON fee_payments;
DROP POLICY IF EXISTS "Authenticated grades" ON grades;
DROP POLICY IF EXISTS "Authenticated exams" ON exams;
DROP POLICY IF EXISTS "Authenticated notices" ON notices;
DROP POLICY IF EXISTS "Authenticated timetable" ON timetable;
DROP POLICY IF EXISTS "Authenticated families" ON families;

CREATE POLICY "Authenticated school_settings" ON school_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated classes" ON classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated subjects" ON subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated students" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated attendance" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated teacher_attendance" ON teacher_attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated fee_items" ON fee_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated fee_payments" ON fee_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated grades" ON grades FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated exams" ON exams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated notices" ON notices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated timetable" ON timetable FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated families" ON families FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════════
--  ONLINE ADMISSION APPLICATIONS
--  Public visitors can submit applications; only signed-in portal users can read/update them.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admission_applications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name         TEXT NOT NULL,
  applying_class       TEXT,
  applying_class_name  TEXT,
  dob                  DATE,
  gender               TEXT,
  father_name          TEXT NOT NULL,
  mother_name          TEXT,
  phone                TEXT NOT NULL,
  whatsapp             TEXT,
  email                TEXT,
  address              TEXT,
  previous_school      TEXT,
  notes                TEXT,
  status               TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'approved', 'rejected')),
  converted_student_id TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public submit admission applications" ON admission_applications;
DROP POLICY IF EXISTS "Authenticated read admission applications" ON admission_applications;
DROP POLICY IF EXISTS "Authenticated update admission applications" ON admission_applications;

CREATE POLICY "Public submit admission applications"
  ON admission_applications FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated read admission applications"
  ON admission_applications FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated update admission applications"
  ON admission_applications FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT INSERT ON admission_applications TO anon;
GRANT SELECT, UPDATE ON admission_applications TO authenticated;

-- ═══════════════════════════════════════════════════════════════
--  HELPER VIEWS
-- ═══════════════════════════════════════════════════════════════

-- Student with class info
CREATE OR REPLACE VIEW students_with_class AS
  SELECT s.*, c.name AS class_name, c.section
  FROM students s
  LEFT JOIN classes c ON s.class_id = c.id;

-- Attendance summary per student
CREATE OR REPLACE VIEW attendance_summary AS
  SELECT
    student_id,
    class_id,
    COUNT(*) FILTER (WHERE status = 'P') AS present_days,
    COUNT(*) FILTER (WHERE status = 'A') AS absent_days,
    COUNT(*) FILTER (WHERE status = 'L') AS leave_days,
    COUNT(*) AS total_days,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'P')::NUMERIC / NULLIF(COUNT(*), 0) * 100
    ) AS attendance_pct
  FROM attendance
  GROUP BY student_id, class_id;

-- Fee summary per student
CREATE OR REPLACE VIEW fee_summary AS
  SELECT
    fp.student_id,
    COUNT(*) FILTER (WHERE fp.paid = TRUE)  AS paid_count,
    COUNT(*) FILTER (WHERE fp.paid = FALSE) AS unpaid_count,
    SUM(fi.amount) FILTER (WHERE fp.paid = TRUE)  AS paid_amount,
    SUM(fi.amount) FILTER (WHERE fp.paid = FALSE) AS unpaid_amount
  FROM fee_payments fp
  JOIN fee_items fi ON fp.fee_item_id = fi.id
  GROUP BY fp.student_id;

-- ═══════════════════════════════════════════════════════════════
--  DONE! Your school database is ready.
--  Next steps:
--  1. Supabase Dashboard -> Authentication -> Users: create/invite users
--     whose emails match the portal profiles in DB.users.
--  2. Confirm your Supabase URL + anon key in index.html.
--  3. Re-run this script on existing projects to replace old anon policies.
-- ═══════════════════════════════════════════════════════════════


