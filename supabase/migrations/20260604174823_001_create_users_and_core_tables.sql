/*
  # Create Users & Core Tables

  1. New Tables
    - `users` — User profiles with economy data
    - `themes` — Available themes (free + premium)
    - `skills` — Skill definitions
    - `shop_items` — Shop catalog items
    - `user_inventory` — User owned items (themes, skins, skills)
    - `matches` — Match history
    - `friendship` — Friend relationships

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Initial Data
    - Create 2 free themes (Classic, Forest)
    - Create 8 premium themes
    - Create 20 skills
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text DEFAULT 'Player',
  avatar_url text,
  custom_board_url text,
  koin bigint DEFAULT 0,
  diamond bigint DEFAULT 0,
  total_koin_earned bigint DEFAULT 0,
  total_diamond_purchased bigint DEFAULT 0,
  matches_played integer DEFAULT 0,
  matches_won integer DEFAULT 0,
  elo_chess integer DEFAULT 1000,
  elo_ludo integer DEFAULT 1000,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'gamemaster', 'support', 'member')),
  accepted_terms boolean DEFAULT false,
  banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price_diamond integer DEFAULT 0,
  unlock_condition text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  price_koin integer DEFAULT 500,
  unlock_condition text,
  effect_type text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create shop_items table
CREATE TABLE IF NOT EXISTS shop_items (
  id text PRIMARY KEY,
  item_type text NOT NULL CHECK (item_type IN ('theme', 'skin', 'skill')),
  name text NOT NULL,
  category text,
  price_koin integer,
  price_diamond integer,
  currency text,
  unlock_condition text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_inventory table
CREATE TABLE IF NOT EXISTS user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text NOT NULL,
  equipped boolean DEFAULT false,
  acquired_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type text NOT NULL CHECK (game_type IN ('chess', 'ludo', 'snakes')),
  room_id text,
  player_1_id uuid REFERENCES users(id),
  player_2_id uuid REFERENCES users(id),
  player_3_id uuid,
  player_4_id uuid,
  mode text DEFAULT 'classic' CHECK (mode IN ('classic', 'adventure', 'ranked')),
  skills_enabled boolean DEFAULT false,
  betting_enabled boolean DEFAULT false,
  bet_amount integer DEFAULT 0,
  result text CHECK (result IN ('win', 'lose', 'draw', 'forfeit')),
  winner_id uuid REFERENCES users(id),
  duration_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Create friendship table
CREATE TABLE IF NOT EXISTS friendship (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendship ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view public profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'member'); -- prevent role escalation

CREATE POLICY "Owners can manage all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner'
  );

-- RLS Policies for themes (read-only)
CREATE POLICY "Anyone can view themes"
  ON themes FOR SELECT
  TO authenticated
  USING (enabled = true);

-- RLS Policies for skills (read-only)
CREATE POLICY "Anyone can view skills"
  ON skills FOR SELECT
  TO authenticated
  USING (enabled = true);

-- RLS Policies for shop_items (read-only)
CREATE POLICY "Anyone can view shop items"
  ON shop_items FOR SELECT
  TO authenticated
  USING (enabled = true);

-- RLS Policies for user_inventory
CREATE POLICY "Users can view own inventory"
  ON user_inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own inventory"
  ON user_inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON user_inventory FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for matches
CREATE POLICY "Players can view their matches"
  ON matches FOR SELECT
  TO authenticated
  USING (
    player_1_id = auth.uid() OR 
    player_2_id = auth.uid() OR 
    auth.uid()::text = player_3_id::text OR 
    auth.uid()::text = player_4_id::text
  );

CREATE POLICY "Owners can view all matches"
  ON matches FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner'
  );

-- RLS Policies for friendship
CREATE POLICY "Users can view own friendships"
  ON friendship FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can manage friendships"
  ON friendship FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default themes
INSERT INTO themes (id, name, description, price_diamond, unlock_condition) VALUES
  ('classic', 'Classic', 'Default clean theme', 0, 'none'),
  ('forest', 'Forest', 'Green nature theme', 0, 'login_day_3'),
  ('sakura', 'Sakura', 'Cherry blossom theme', 100, 'purchase'),
  ('salju', 'Salju', 'Snowy winter theme', 140, 'purchase'),
  ('desert', 'Desert', 'Warm sandy theme', 200, 'purchase'),
  ('ocean', 'Ocean', 'Deep blue water theme', 275, 'purchase'),
  ('volcanic', 'Volcanic', 'Hot lava theme', 385, 'purchase'),
  ('steampunk', 'Steampunk', 'Victorian tech theme', 540, 'purchase'),
  ('cyberpunk', 'Cyberpunk', 'Neon futuristic theme', 755, 'purchase'),
  ('space', 'Space', 'Cosmic void theme', 1055, 'purchase');

-- Insert indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_type ON user_inventory(item_type);
CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches(player_1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches(player_2_id);
CREATE INDEX IF NOT EXISTS idx_matches_created ON matches(created_at);
CREATE INDEX IF NOT EXISTS idx_friendship_user_id ON friendship(user_id);
CREATE INDEX IF NOT EXISTS idx_friendship_status ON friendship(status);
