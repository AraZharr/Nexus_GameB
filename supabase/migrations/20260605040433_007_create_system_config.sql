-- System config table for storing secrets and settings
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Only owner/admin can read system_config
CREATE POLICY "system_config_select_admin" ON system_config FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Only owner can insert/update
CREATE POLICY "system_config_insert_owner" ON system_config FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "system_config_update_owner" ON system_config FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

-- Insert bootstrap secret (service role bypasses RLS for this initial insert)
-- The secret will be read by the promote-role edge function using service role key
INSERT INTO system_config (key, value, description) VALUES
  ('bootstrap_secret', 'nexus-bootstrap-a9a222591b1b90d84414565a3c1e5e38', 'One-time secret for creating the first Owner account. Delete after use.');
