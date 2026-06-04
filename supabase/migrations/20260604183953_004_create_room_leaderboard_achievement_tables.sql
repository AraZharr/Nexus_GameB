CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  host_id uuid NOT NULL REFERENCES users(id),
  game_type text NOT NULL CHECK (game_type IN ('chess', 'ludo', 'snakes')),
  mode text DEFAULT 'classic' CHECK (mode IN ('classic', 'adventure', 'ranked')),
  skills_enabled boolean DEFAULT false,
  betting_enabled boolean DEFAULT false,
  betting_min integer DEFAULT 50,
  betting_max integer DEFAULT 1000,
  max_players integer DEFAULT 2,
  timer_seconds integer DEFAULT 300,
  is_private boolean DEFAULT false,
  pin text,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  pot_total integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ready boolean DEFAULT false,
  bet_amount integer DEFAULT 0,
  is_spectator boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  condition_type text NOT NULL,
  condition_value integer NOT NULL,
  reward_koin integer DEFAULT 0,
  reward_diamond integer DEFAULT 0,
  enabled boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES achievements(id),
  progress integer DEFAULT 0,
  unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_type text NOT NULL,
  target integer NOT NULL,
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  reward_koin integer DEFAULT 0,
  date text NOT NULL,
  UNIQUE(user_id, quest_type, date)
);

CREATE TABLE IF NOT EXISTS economy_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency text NOT NULL CHECK (currency IN ('koin', 'diamond')),
  amount bigint NOT NULL,
  reason text NOT NULL,
  reference_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view waiting rooms" ON rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create rooms" ON rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update rooms" ON rooms FOR UPDATE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "Users can view room players" ON room_players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join rooms" ON room_players FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ready status" ON room_players FOR UPDATE to authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT TO authenticated USING (enabled = true);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own quests" ON daily_quests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quests" ON daily_quests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quests" ON daily_quests FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON economy_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create transactions" ON economy_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_quests_user_date ON daily_quests(user_id, date);
CREATE INDEX IF NOT EXISTS idx_economy_transactions_user ON economy_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_economy_transactions_created ON economy_transactions(created_at);

-- Insert achievements
INSERT INTO achievements (id, name, description, category, condition_type, condition_value, reward_koin, reward_diamond) VALUES
  ('first_win', 'First Victory', 'Win your first match', 'wins', 'total_wins', 1, 50, 0),
  ('win_10', 'Getting Started', 'Win 10 matches', 'wins', 'total_wins', 10, 100, 0),
  ('win_50', 'Veteran Player', 'Win 50 matches', 'wins', 'total_wins', 50, 200, 10),
  ('win_100', 'Champion', 'Win 100 matches', 'wins', 'total_wins', 100, 500, 25),
  ('play_10', 'Regular Player', 'Play 10 matches', 'games', 'total_games', 10, 50, 0),
  ('play_50', 'Dedicated Player', 'Play 50 matches', 'games', 'total_games', 50, 150, 5),
  ('play_100', 'Hardcore Player', 'Play 100 matches', 'games', 'total_games', 100, 300, 15),
  ('chess_10', 'Chess Enthusiast', 'Play 10 chess matches', 'games', 'chess_games', 10, 50, 0),
  ('ludo_10', 'Ludo Lover', 'Play 10 Ludo matches', 'games', 'ludo_games', 10, 50, 0),
  ('snakes_10', 'Snake Charmer', 'Play 10 Snakes matches', 'games', 'snakes_games', 10, 50, 0),
  ('chess_elo_1200', 'Chess Student', 'Reach 1200 ELO in Chess', 'rank', 'chess_elo', 1200, 100, 5),
  ('chess_elo_1500', 'Chess Master', 'Reach 1500 ELO in Chess', 'rank', 'chess_elo', 1500, 300, 20),
  ('ludo_elo_1200', 'Ludo Student', 'Reach 1200 ELO in Ludo', 'rank', 'ludo_elo', 1200, 100, 5),
  ('ludo_elo_1500', 'Ludo Master', 'Reach 1500 ELO in Ludo', 'rank', 'ludo_elo', 1500, 300, 20),
  ('streak_5', 'On Fire', '5 win streak', 'wins', 'win_streak', 5, 100, 0),
  ('streak_10', 'Unstoppable', '10 win streak', 'wins', 'win_streak', 10, 300, 15),
  ('friend_5', 'Social Butterfly', 'Add 5 friends', 'social', 'friends_count', 5, 50, 0),
  ('friend_20', 'Popular', 'Add 20 friends', 'social', 'friends_count', 20, 100, 5),
  ('earn_1000', 'Coin Collector', 'Earn 1,000 Koin total', 'economy', 'total_koin', 1000, 50, 0),
  ('earn_10000', 'Wealthy Player', 'Earn 10,000 Koin total', 'economy', 'total_koin', 10000, 200, 10),
  ('skill_first', 'Skill Master', 'Purchase your first skill', 'skills', 'skills_owned', 1, 50, 0),
  ('skill_5', 'Skill Collector', 'Own 5 skills', 'skills', 'skills_owned', 5, 100, 5),
  ('theme_first', 'Fashion Forward', 'Purchase your first theme', 'economy', 'themes_owned', 1, 50, 0),
  ('daily_7', 'Week Warrior', '7-day login streak', 'login', 'login_streak', 7, 100, 10),
  ('daily_30', 'Monthly Dedicated', '30-day login streak', 'login', 'login_streak', 30, 500, 50),
  ('bet_first', 'High Roller', 'Place your first bet', 'betting', 'bets_placed', 1, 50, 0),
  ('bet_10', 'Regular Better', 'Place 10 bets', 'betting', 'bets_placed', 10, 100, 0),
  ('rps_10', 'RPS Player', 'Win 10 RPS games', 'social', 'rps_wins', 10, 50, 0),
  ('chess_win_10', 'Chess Victor', 'Win 10 chess matches', 'wins', 'chess_wins', 10, 150, 5),
  ('ludo_win_10', 'Ludo Victor', 'Win 10 Ludo matches', 'wins', 'ludo_wins', 10, 150, 5)
ON CONFLICT (id) DO NOTHING;