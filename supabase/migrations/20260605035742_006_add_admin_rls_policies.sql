-- Add admin update policy for users table (for ban/unban and role changes)
-- Only owner and admin can update other users' records
-- Users can still update their own profile (existing policy implied)

-- First check if a general update policy exists, if not add one
-- Allow users to update their own profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_update_own'
  ) THEN
    CREATE POLICY "users_update_own" ON users FOR UPDATE
      TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Allow admins (owner/admin) to update any user's banned status and role
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_admin_update'
  ) THEN
    CREATE POLICY "users_admin_update" ON users FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
      );
  END IF;
END $$;
