-- ==============================================================================
-- OXFORD EXCELLENCE ACADEMY - PRODUCTION ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Protection Goals:
-- 1. Shield sensitive school data (students, staff, fees, attendance, grades)
--    from unauthorized anonymous / public API access via the public anon key.
-- 2. Allow public/prospective parents to SUBMIT online admission applications.
-- 3. Allow public visitors to READ public landing page notices and school info.
-- 4. Grant full authenticated access to logged-in teachers, staff, and admin.
-- 5. Secure storage.objects for portal_images bucket.
-- ==============================================================================

-- 1. Enable RLS on all portal tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE miscellaneous ENABLE ROW LEVEL SECURITY;

-- If tables exist, enable RLS on them as well
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admission_applications') THEN
    ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_public') THEN
    ALTER TABLE site_public ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'whatsapp_outbox') THEN
    ALTER TABLE whatsapp_outbox ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 2. Clean up legacy insecure "Allow All" policies
DROP POLICY IF EXISTS "Allow All" ON classes;
DROP POLICY IF EXISTS "Allow All" ON students;
DROP POLICY IF EXISTS "Allow All" ON staff;
DROP POLICY IF EXISTS "Allow All" ON attendance;
DROP POLICY IF EXISTS "Allow All" ON fees;
DROP POLICY IF EXISTS "Allow All" ON grades;
DROP POLICY IF EXISTS "Allow All" ON settings;
DROP POLICY IF EXISTS "Allow All" ON miscellaneous;
DROP POLICY IF EXISTS "Allow All" ON admission_applications;
DROP POLICY IF EXISTS "Allow All" ON site_public;
DROP POLICY IF EXISTS "Allow All" ON whatsapp_outbox;

-- Drop prior authenticated policies if reapplying
DROP POLICY IF EXISTS "Authenticated users full access" ON classes;
DROP POLICY IF EXISTS "Authenticated users full access" ON students;
DROP POLICY IF EXISTS "Authenticated users full access" ON staff;
DROP POLICY IF EXISTS "Authenticated users full access" ON attendance;
DROP POLICY IF EXISTS "Authenticated users full access" ON fees;
DROP POLICY IF EXISTS "Authenticated users full access" ON grades;
DROP POLICY IF EXISTS "Authenticated users full access" ON settings;
DROP POLICY IF EXISTS "Authenticated users full access" ON miscellaneous;
DROP POLICY IF EXISTS "Authenticated users full access" ON whatsapp_outbox;

DROP POLICY IF EXISTS "Allow public insert to admission_applications" ON admission_applications;
DROP POLICY IF EXISTS "Allow authenticated full access to admission_applications" ON admission_applications;
DROP POLICY IF EXISTS "Allow public read site_public" ON site_public;
DROP POLICY IF EXISTS "Allow authenticated manage site_public" ON site_public;

-- 3. Core School Tables: STRICT AUTHENTICATED ACCESS ONLY
-- (Strangers using anon key without login will get 403 / empty set)
CREATE POLICY "Authenticated users full access" ON classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON staff FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON fees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON grades FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users full access" ON miscellaneous FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'whatsapp_outbox') THEN
    CREATE POLICY "Authenticated users full access" ON whatsapp_outbox FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. Online Admissions: Public can INSERT, Staff/Admin can READ and MANAGE
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admission_applications') THEN
    CREATE POLICY "Allow public insert to admission_applications" ON admission_applications 
      FOR INSERT TO anon, authenticated WITH CHECK (true);
    CREATE POLICY "Allow authenticated full access to admission_applications" ON admission_applications 
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. Public Landing Page: Public can READ, Authenticated can UPDATE
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_public') THEN
    CREATE POLICY "Allow public read site_public" ON site_public 
      FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow authenticated manage site_public" ON site_public 
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 6. Storage Bucket Security (portal_images)
DROP POLICY IF EXISTS "Allow public uploads to portal_images_2" ON storage.objects;
DROP POLICY IF EXISTS "Public can view portal_images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload portal_images" ON storage.objects;

-- Anyone can view photos (for ID cards, landing page)
CREATE POLICY "Public can view portal_images" ON storage.objects 
  FOR SELECT TO anon, authenticated USING (bucket_id = 'portal_images');

-- Only logged-in staff/admin can upload photos
CREATE POLICY "Authenticated can upload portal_images" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portal_images');
