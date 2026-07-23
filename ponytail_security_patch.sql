-- ==========================================
--  PONYTAIL SECURITY PATCH
-- ==========================================
-- This script fixes the massive security vulnerability where any logged-in 
-- user (including students) can download the entire JSON database.

-- 1. Drop the unsafe read policy
DROP POLICY IF EXISTS "Authenticated read db_snapshot" ON db_snapshot;

-- 2. Create a new, secure read policy (Only Admins and Teachers can read the full snapshot)
CREATE POLICY "Admin and Teacher read db_snapshot" ON db_snapshot
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'teacher')
    )
  );

-- Now, students and parents can no longer download `db_snapshot`.
-- Note: You MUST apply the index.html frontend updates before running this,
-- otherwise the student dashboard will stop loading!
