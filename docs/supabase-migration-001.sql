-- ============================================
-- マイグレーション: UUID → TEXT
--
-- 問題: プレイヤーIDがUUID形式ではなく文字列形式
-- 例: "mr5SzDrOjSzF5UYeSVQrD"
-- ============================================

-- トランザクション開始
BEGIN;

-- ============================================
-- 1. 既存のRLSポリシーを削除
-- ============================================

DROP POLICY IF EXISTS "Users can view their own rooms" ON rooms;
DROP POLICY IF EXISTS "Service role can insert rooms" ON rooms;

DROP POLICY IF EXISTS "Users can view matches they participated in" ON matches;
DROP POLICY IF EXISTS "Service role can insert matches" ON matches;
DROP POLICY IF EXISTS "Service role can update matches" ON matches;

DROP POLICY IF EXISTS "Users can view actions of their matches" ON game_actions;
DROP POLICY IF EXISTS "Service role can insert game_actions" ON game_actions;

-- ============================================
-- 2. 外部キー制約を削除
-- ============================================

-- rooms.created_by の外部キー削除
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_created_by_fkey;

-- matches.player1_id, player2_id の外部キー削除
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_player1_id_fkey;
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_player2_id_fkey;

-- game_actions.player_id の外部キー削除
ALTER TABLE game_actions DROP CONSTRAINT IF EXISTS game_actions_player_id_fkey;

-- ============================================
-- 3. カラム型を UUID → TEXT に変更
-- ============================================

-- rooms.created_by
ALTER TABLE rooms ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;

-- matches.player1_id, player2_id
ALTER TABLE matches ALTER COLUMN player1_id TYPE TEXT USING player1_id::TEXT;
ALTER TABLE matches ALTER COLUMN player2_id TYPE TEXT USING player2_id::TEXT;

-- game_actions.player_id
ALTER TABLE game_actions ALTER COLUMN player_id TYPE TEXT USING player_id::TEXT;

-- ============================================
-- 4. RLSポリシーを再作成 (auth.uid()::text で比較)
-- ============================================

-- roomsテーブル
CREATE POLICY "Users can view their own rooms"
  ON rooms FOR SELECT TO authenticated
  USING (created_by = auth.uid()::text);

CREATE POLICY "Service role can insert rooms"
  ON rooms FOR INSERT TO service_role
  WITH CHECK (true);

-- matchesテーブル
CREATE POLICY "Users can view matches they participated in"
  ON matches FOR SELECT TO authenticated
  USING (player1_id = auth.uid()::text OR player2_id = auth.uid()::text);

CREATE POLICY "Service role can insert matches"
  ON matches FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update matches"
  ON matches FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

-- game_actionsテーブル
CREATE POLICY "Users can view actions of their matches"
  ON game_actions FOR SELECT TO authenticated
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE player1_id = auth.uid()::text OR player2_id = auth.uid()::text
    )
  );

CREATE POLICY "Service role can insert game_actions"
  ON game_actions FOR INSERT TO service_role
  WITH CHECK (true);

-- トランザクション確定
COMMIT;
