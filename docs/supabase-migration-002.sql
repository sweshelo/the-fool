-- ============================================
-- マイグレーション: matchesテーブルにmatching_modeカラムを追加
--
-- マッチの起源を記録する
--   NULL = 手動でルーム作成（RoomOpenRequest経由）
--   'freedom' / 'standard' / 'legacy' / 'limited' = マッチングシステム経由
-- ============================================

BEGIN;

ALTER TABLE matches ADD COLUMN IF NOT EXISTS matching_mode VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_matches_matching_mode ON matches(matching_mode);

COMMIT;
