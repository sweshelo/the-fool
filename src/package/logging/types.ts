import type { Rule } from '@/submodule/suit/types/rule';
import type { Payload } from '@/submodule/suit/types/message/payload';

/** ルーム作成ログ */
export interface RoomLog {
  room_id: string;
  name: string;
  rule: Rule;
  created_by?: string;
}

/** マッチ開始ログ */
export interface MatchStartLog {
  room_id: string;
  player1_id?: string;
  player1_name: string;
  player1_deck: string[];
  player1_jokers?: string[];
  player2_id?: string;
  player2_name: string;
  player2_deck: string[];
  player2_jokers?: string[];
  first_player_index: number;
  seed?: number;
}

/** マッチ終了理由 */
export type MatchEndReason = 'life_zero' | 'surrender' | 'round_limit' | 'aborted';

/** マッチ終了ログ */
export interface MatchEndLog {
  match_id: string;
  winner_index: number | null;
  end_reason: MatchEndReason;
  total_rounds: number;
  total_turns: number;
}

/** ゲームアクションログ */
export interface GameActionLog {
  match_id: string;
  sequence_number: number;
  round: number;
  turn: number;
  player_id?: string;
  action_type: string;
  action_handler: string;
  payload: Payload;
}

/** ロガー設定 */
export interface LoggerConfig {
  enabled: boolean;
  batchSize: number;
  flushInterval: number;
}
