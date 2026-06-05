-- Drop old role constraint and add new one with updated roles
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role = ANY (ARRAY['owner', 'admin', 'moderator', 'user']));

-- Migrate existing data: gamemaster -> admin, support -> moderator, member -> user
UPDATE users SET role = 'admin' WHERE role = 'gamemaster';
UPDATE users SET role = 'moderator' WHERE role = 'support';
UPDATE users SET role = 'user' WHERE role = 'member';
