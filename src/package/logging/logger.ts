import type { Message } from '@/submodule/suit/types/message/message';
import type { Rule } from '@/submodule/suit/types/rule';
import type { Core } from '../core';
import type {
  RoomLog,
  MatchStartLog,
  MatchEndLog,
  MatchEndReason,
  GameActionLog,
  LoggerConfig,
} from './types';
import { ActionQueue } from './queue';
import { getSupabaseClient } from './supabase-client';
import { error as logError } from '@/package/console-logger';

const defaultConfig: LoggerConfig = {
  enabled: true,
  batchSize: 50,
  flushInterval: 5000,
};

export class GameLogger {
  private config: LoggerConfig;
  private actionQueue: ActionQueue;
  private matchId: string | null = null;
  private sequenceNumber: number = 0;
  private pendingActions: { core: Core; message: Message }[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.actionQueue = new ActionQueue(this.config.batchSize, this.config.flushInterval);
  }

  /** ルーム作成をログ */
  async logRoomCreation(
    roomId: string,
    name: string,
    rule: Rule,
    createdBy?: string
  ): Promise<void> {
    if (!this.isEnabled()) return;

    const log: RoomLog = {
      room_id: roomId,
      name,
      rule,
      created_by: createdBy,
    };

    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client.from('rooms').insert(log);
    if (error) logError('Logger', 'Failed to log room creation:', error);
  }

  /** マッチ開始をログ */
  async logMatchStart(core: Core): Promise<string | null> {
    if (!this.isEnabled()) return null;

    const [player1, player2] = core.players;
    if (!player1 || !player2) return null;

    const log: MatchStartLog = {
      room_id: core.room.id,
      player1_id: player1.id,
      player1_name: player1.name,
      player1_deck: player1.library,
      player1_jokers: player1.joker.card.map(j => j.catalogId),
      player2_id: player2.id,
      player2_name: player2.name,
      player2_deck: player2.library,
      player2_jokers: player2.joker.card.map(j => j.catalogId),
      first_player_index: core.firstPlayerIndex,
      matching_mode: core.room.matchingMode,
    };

    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client.from('matches').insert(log).select('id').single();

    if (error) {
      logError('Logger', 'Failed to log match start:', error);
      return null;
    }

    this.matchId = data.id;
    this.sequenceNumber = 0;

    // バッファリングされたアクションを処理
    for (const { core: actionCore, message } of this.pendingActions) {
      this.logActionInternal(actionCore, message);
    }
    this.pendingActions = [];

    return this.matchId;
  }

  /** ゲームアクションをログ（キュー経由） */
  logAction(core: Core, message: Message): void {
    if (!this.isEnabled()) return;

    if (!this.matchId) {
      // matchId が未確定の場合はバッファリング
      this.pendingActions.push({ core, message });
      return;
    }

    this.logActionInternal(core, message);
  }

  private logActionInternal(core: Core, message: Message): void {
    if (!this.matchId) return;

    // payloadからplayer情報を抽出（存在する場合のみ）
    const payload = message.payload;
    const playerId =
      'player' in payload && typeof payload.player === 'string' ? payload.player : undefined;

    const log: GameActionLog = {
      match_id: this.matchId,
      sequence_number: ++this.sequenceNumber,
      round: core.round,
      turn: core.turn,
      player_id: playerId,
      action_type: message.payload.type,
      action_handler: message.action.handler,
      payload: message.payload,
    };

    this.actionQueue.enqueue(log);
  }

  /** マッチ終了をログ */
  async logMatchEnd(
    core: Core,
    winnerIndex: number | null,
    endReason: MatchEndReason
  ): Promise<void> {
    if (!this.isEnabled() || !this.matchId) return;

    await this.actionQueue.flush();

    const log: MatchEndLog = {
      match_id: this.matchId,
      winner_index: winnerIndex,
      end_reason: endReason,
      total_rounds: core.round,
      total_turns: core.turn,
    };

    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client
      .from('matches')
      .update({
        winner_index: log.winner_index,
        end_reason: log.end_reason,
        total_rounds: log.total_rounds,
        total_turns: log.total_turns,
        ended_at: new Date().toISOString(),
      })
      .eq('id', this.matchId);

    if (error) logError('Logger', 'Failed to log match end:', error);

    this.matchId = null;
  }

  private isEnabled(): boolean {
    return this.config.enabled && getSupabaseClient() !== null;
  }

  /** リソース解放 */
  async dispose(): Promise<void> {
    await this.actionQueue.flush();
    this.actionQueue.stop();
  }
}
