CREATE TABLE IF NOT EXISTS global_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  type text DEFAULT 'text',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE global_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view global messages" ON global_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can send global messages" ON global_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their DMs" ON direct_messages FOR SELECT TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can send DMs" ON direct_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can update read status" ON direct_messages FOR UPDATE TO authenticated USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_global_messages_created ON global_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created ON direct_messages(created_at);