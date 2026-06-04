-- Insert skills data
INSERT INTO skills (id, name, category, description, price_koin, unlock_condition, effect_type) VALUES
  ('checkmate_soon', 'Checkmate Soon', 'taunt', 'Text overlay + crown emoji burst', 500, 'none', 'text_overlay'),
  ('nice_try', 'Nice Try', 'taunt', 'Text overlay + clap emoji', 500, 'none', 'text_overlay'),
  ('oops', 'Oops', 'taunt', 'Text overlay + sweat drop', 500, 'none', 'text_overlay'),
  ('gg', 'GG', 'taunt', 'Text overlay + handshake', 800, 'play_10', 'text_overlay'),
  ('silence', 'Silence', 'taunt', 'Text overlay + mute icon', 1000, 'win_5', 'text_overlay'),
  ('fire_trail', 'Fire Trail', 'visual', 'Piece moves with fire particle trail', 1200, 'play_5', 'particle_trail'),
  ('ice_freeze', 'Ice Freeze', 'visual', 'Piece moves with frost particle', 1200, 'play_5', 'particle_trail'),
  ('lightning', 'Lightning', 'visual', 'Flash + lightning bolt on capture', 2500, 'win_10', 'screen_flash'),
  ('rainbow', 'Rainbow', 'visual', 'Rainbow trail on piece move', 2000, 'win_10', 'particle_trail'),
  ('ghost', 'Ghost', 'visual', 'Transparent piece + ghost trail', 3000, 'rank_silver', 'particle_trail'),
  ('portal', 'Portal', 'visual', 'Piece teleport with swirl effect', 4000, 'rank_gold', 'particle_trail'),
  ('drum_roll', 'Drum Roll', 'audio', 'Drum roll SFX on opponent turn', 1000, 'none', 'audio'),
  ('laugh_track', 'Laugh Track', 'audio', 'Sitcom laugh on bad move', 1500, 'win_5', 'audio'),
  ('dramatic', 'Dramatic', 'audio', 'Orchestra sting on critical moment', 2000, 'win_15', 'audio'),
  ('spotlight', 'Spotlight', 'board', 'Spotlight on newly moved cell', 1500, 'none', 'board_effect'),
  ('darkness', 'Darkness', 'board', 'Dark board edges, bright active area', 2000, 'play_10', 'board_effect'),
  ('grid_pulse', 'Grid Pulse', 'board', 'Board grid pulse with theme color', 2500, 'win_10', 'board_effect'),
  ('confetti', 'Confetti', 'board', 'Confetti burst on win', 3000, 'win_20', 'confetti'),
  ('lucky_star', 'Lucky Star', 'dice', 'Dice glow gold on roll', 1000, 'play_10_ludo', 'dice_effect'),
  ('double_trouble', 'Double Trouble', 'dice', 'Dice spin animation extra fast', 1500, 'win_10_ludo', 'dice_effect')
ON CONFLICT (id) DO NOTHING;

-- Insert shop items for skins
INSERT INTO shop_items (id, item_type, name, category, price_koin, currency, unlock_condition) VALUES
  ('dice_basic', 'skin', 'Basic Dice', 'dice', 500, 'koin', 'none'),
  ('dice_ice', 'skin', 'Ice Dice', 'dice', 1200, 'koin', 'play_10_ludo'),
  ('dice_fire', 'skin', 'Fire Dice', 'dice', 2500, 'koin', 'win_10_ludo'),
  ('dice_gold', 'skin', 'Gold Dice', 'dice', 5000, 'koin', 'rank_gold'),
  ('chess_classic', 'skin', 'Classic Chess Set', 'chess_piece', 2000, 'koin', 'play_10_chess'),
  ('chess_modern', 'skin', 'Modern Chess Set', 'chess_piece', 4000, 'koin', 'win_10_chess'),
  ('chess_royal', 'skin', 'Royal Chess Set', 'chess_piece', 7000, 'koin', 'rank_silver'),
  ('chess_legend', 'skin', 'Legend Chess Set', 'chess_piece', 10000, 'koin', 'rank_gold'),
  ('board_wood', 'skin', 'Wood Board Mat', 'board', 3000, 'koin', 'none'),
  ('board_marble', 'skin', 'Marble Board Mat', 'board', 5000, 'koin', 'play_20'),
  ('board_neon', 'skin', 'Neon Board Mat', 'board', 8000, 'koin', 'win_20'),
  ('avatar_basic', 'skin', 'Basic Avatar Frame', 'avatar_frame', 1500, 'koin', 'none'),
  ('avatar_gold', 'skin', 'Gold Avatar Frame', 'avatar_frame', 5000, 'koin', 'win_20'),
  ('avatar_diamond', 'skin', 'Diamond Avatar Frame', 'avatar_frame', 12000, 'koin', 'rank_gold')
ON CONFLICT (id) DO NOTHING;