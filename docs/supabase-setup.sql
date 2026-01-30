-- ============================================
-- Supabase ロギング用テーブル・RLS設定
-- ============================================

-- 1. roomsテーブル（ルーム作成ログ）
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(5) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  rule JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);

-- 2. matchesテーブル（マッチング成立ログ）
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(5) NOT NULL,

  -- プレイヤー1
  player1_id UUID REFERENCES auth.users(id),
  player1_name VARCHAR(255) NOT NULL,
  player1_deck JSONB NOT NULL,
  player1_jokers JSONB,

  -- プレイヤー2
  player2_id UUID REFERENCES auth.users(id),
  player2_name VARCHAR(255) NOT NULL,
  player2_deck JSONB NOT NULL,
  player2_jokers JSONB,

  -- ゲーム情報
  first_player_index INT,
  winner_index INT,
  end_reason VARCHAR(50),
  total_rounds INT,
  total_turns INT,

  -- タイムスタンプ
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  -- 将来用（乱数シード）
  seed BIGINT
);

CREATE INDEX IF NOT EXISTS idx_matches_player1_id ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2_id ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_started_at ON matches(started_at);

-- 3. game_actionsテーブル（ゲームアクションログ）
CREATE TABLE IF NOT EXISTS game_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,

  sequence_number INT NOT NULL,
  round INT NOT NULL,
  turn INT NOT NULL,
  player_id UUID REFERENCES auth.users(id),
  player_index INT NOT NULL,

  action_type VARCHAR(50) NOT NULL,
  action_handler VARCHAR(20) NOT NULL,
  payload JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_match_sequence UNIQUE (match_id, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_game_actions_match_id ON game_actions(match_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_action_type ON game_actions(action_type);

-- ============================================
-- RLSポリシー設定
-- ============================================

-- roomsテーブル
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- 自分が作成したルームのみ閲覧可能
CREATE POLICY "Users can view their own rooms"
  ON rooms FOR SELECT TO authenticated
  USING (created_by = auth.uid());

-- Service Roleのみ挿入可能
CREATE POLICY "Service role can insert rooms"
  ON rooms FOR INSERT TO service_role
  WITH CHECK (true);

-- matchesテーブル
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 自分が参加した試合（相手の記録含む）を閲覧可能
CREATE POLICY "Users can view matches they participated in"
  ON matches FOR SELECT TO authenticated
  USING (player1_id = auth.uid() OR player2_id = auth.uid());

-- Service Roleのみ挿入・更新可能
CREATE POLICY "Service role can insert matches"
  ON matches FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update matches"
  ON matches FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

-- game_actionsテーブル
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;

-- 参加した試合のアクションを閲覧可能
CREATE POLICY "Users can view actions of their matches"
  ON game_actions FOR SELECT TO authenticated
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE player1_id = auth.uid() OR player2_id = auth.uid()
    )
  );

-- Service Roleのみ挿入可能
CREATE POLICY "Service role can insert game_actions"
  ON game_actions FOR INSERT TO service_role
  WITH CHECK (true);
