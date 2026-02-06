import type { ServerWebSocket } from 'bun';
import type { PlayerDeck, Rule } from '@/submodule/suit/types';

/**
 * マッチングモード
 */
export type MatchingMode = 'freedom' | 'standard' | 'legacy' | 'limited';

/**
 * キュー内のプレイヤー情報
 */
export interface QueuedPlayer {
  id: string;
  socket: ServerWebSocket;
  player: {
    name: string;
    id: string;
    deck: PlayerDeck;
  };
  queuedAt: number;
}

/**
 * マッチング結果
 */
export interface MatchResult {
  player1: QueuedPlayer;
  player2: QueuedPlayer;
}

/**
 * キュー参加結果
 */
export type JoinResult =
  | { success: true; matched: false; queueId: string; position: number }
  | { success: true; matched: true; matchResult: MatchResult }
  | { success: false; error: JoinError; invalidCards?: string[] };

/**
 * キュー参加エラー
 */
export type JoinError =
  | 'already_in_queue'
  | 'invalid_deck_size'
  | 'card_not_found'
  | 'card_restriction_violation'
  | 'deck_restriction_violation';

/**
 * バリデーションエラー
 */
export interface ValidationError {
  type: 'deck_size' | 'card_not_found' | 'card_restriction' | 'deck_restriction';
  message: string;
  cardIds?: string[];
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * ルールオーバーライド（Ruleの部分的上書き）
 */
export type RuleOverrides = Partial<Pick<Rule, 'joker' | 'player'>>;

/**
 * カード単体の制限条件
 */
export type CardRestriction =
  | { type: 'version'; operator: '<=' | '>=' | '==' | '<' | '>'; value: number }
  | { type: 'and'; conditions: CardRestriction[] }
  | { type: 'or'; conditions: CardRestriction[] }
  | { type: 'not'; condition: CardRestriction };

/**
 * デッキ全体の制限条件
 */
export type DeckRestriction =
  | { type: 'sameNameLimit'; max: number }
  | { type: 'totalOriginality'; min: number };

/**
 * モード設定
 */
export interface ModeConfig {
  cardRestriction: CardRestriction | null;
  deckRestriction: DeckRestriction | null;
  ruleOverrides: RuleOverrides;
  description: string;
}
