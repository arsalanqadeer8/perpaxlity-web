import sys
import re

with open('H:/web/school_database_setup.sql', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'''DROP POLICY IF EXISTS "Authenticated db_snapshot" ON db_snapshot;
CREATE POLICY "Authenticated db_snapshot" ON db_snapshot
  FOR ALL TO authenticated
  USING \(true\)
  WITH CHECK \(true\);'''

replacement = '''DROP POLICY IF EXISTS "Authenticated db_snapshot" ON db_snapshot;
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
  );'''

new_content = re.sub(pattern, replacement, content)

with open('H:/web/school_database_setup.sql', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Updated school_database_setup.sql security successfully.')
