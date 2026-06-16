-- Allow admins to read all user rows
-- (needed for admin pages: applications, users list, order management)
-- The existing policy only allows auth.uid() = id, which breaks joins
-- like .select('*, users(email, full_name)') when an admin queries.

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
