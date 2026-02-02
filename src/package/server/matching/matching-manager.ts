import { DeckValidator } from './deck-validator';
import type { JoinResult, MatchingMode, MatchResult, QueuedPlayer } from './types';

/**
 * マッチングマネージャー
 * モード別のキュー管理とマッチング処理を行う
 */
export class MatchingManager {
  /** モード別のキュー（Map<queueId, QueuedPlayer>） */
  private queues: Map<MatchingMode, Map<string, QueuedPlayer>> = new Map();

  /** ユーザーID -> 参加中のモード */
  private userToQueue: Map<string, MatchingMode> = new Map();

  /** デッキバリデーター */
  private validator: DeckValidator;

  /** キューID生成用カウンター */
  private queueIdCounter = 0;

  constructor() {
    this.validator = new DeckValidator();

    // 各モードのキューを初期化
    const modes: MatchingMode[] = ['freedom', 'standard', 'legacy', 'limited'];
    for (const mode of modes) {
      this.queues.set(mode, new Map());
    }
  }

  /**
   * キューに参加する
   */
  join(mode: MatchingMode, player: QueuedPlayer): JoinResult {
    // 1. 重複チェック
    if (this.userToQueue.has(player.id)) {
      return { success: false, error: 'already_in_queue' };
    }

    // 2. デッキバリデーション
    const validationResult = this.validator.validate(mode, player.player.deck);
    if (!validationResult.valid) {
      const firstError = validationResult.errors[0];
      if (firstError) {
        switch (firstError.type) {
          case 'deck_size':
            return { success: false, error: 'invalid_deck_size' };
          case 'card_not_found':
            return { success: false, error: 'card_not_found', invalidCards: firstError.cardIds };
          case 'card_restriction':
            return {
              success: false,
              error: 'card_restriction_violation',
              invalidCards: firstError.cardIds,
            };
          case 'deck_restriction':
            return { success: false, error: 'deck_restriction_violation' };
        }
      }
    }

    // 3. キューに追加
    const queueId = this.generateQueueId();
    const queue = this.queues.get(mode);
    if (!queue) {
      // 通常ここには来ないはずだが安全のため
      return { success: false, error: 'invalid_deck_size' };
    }

    queue.set(queueId, player);
    this.userToQueue.set(player.id, mode);

    // 4. マッチング試行
    const matchResult = this.tryMatch(mode);
    if (matchResult) {
      return { success: true, matched: true, matchResult };
    }

    // マッチングしなかった場合はキュー参加のみ
    return {
      success: true,
      matched: false,
      queueId,
      position: queue.size,
    };
  }

  /**
   * キューから離脱する
   */
  leave(userId: string): boolean {
    const mode = this.userToQueue.get(userId);
    if (!mode) {
      return false;
    }

    const queue = this.queues.get(mode);
    if (!queue) {
      return false;
    }

    // キューからプレイヤーを探して削除
    for (const [queueId, player] of queue.entries()) {
      if (player.id === userId) {
        queue.delete(queueId);
        this.userToQueue.delete(userId);
        return true;
      }
    }

    return false;
  }

  /**
   * マッチング試行 - 2人揃ったらマッチ
   */
  private tryMatch(mode: MatchingMode): MatchResult | null {
    const queue = this.queues.get(mode);
    if (!queue || queue.size < 2) {
      return null;
    }

    // キューから最初の2人を取り出す（FIFO）
    const entries = Array.from(queue.entries());
    const entry1 = entries[0];
    const entry2 = entries[1];
    if (!entry1 || !entry2) {
      return null;
    }
    const [queueId1, player1] = entry1;
    const [queueId2, player2] = entry2;

    // キューから削除
    queue.delete(queueId1);
    queue.delete(queueId2);
    this.userToQueue.delete(player1.id);
    this.userToQueue.delete(player2.id);

    return { player1, player2 };
  }

  /**
   * 特定モードのキューサイズを取得する
   */
  getQueueSize(mode: MatchingMode): number {
    return this.queues.get(mode)?.size ?? 0;
  }

  /**
   * ユーザーがキューに参加しているか確認する
   */
  isInQueue(userId: string): boolean {
    return this.userToQueue.has(userId);
  }

  /**
   * ユーザーが参加しているモードを取得する
   */
  getUserMode(userId: string): MatchingMode | undefined {
    return this.userToQueue.get(userId);
  }

  /**
   * 全モードのキューサイズを取得する
   */
  getAllQueueSizes(): Record<MatchingMode, number> {
    return {
      freedom: this.getQueueSize('freedom'),
      standard: this.getQueueSize('standard'),
      legacy: this.getQueueSize('legacy'),
      limited: this.getQueueSize('limited'),
    };
  }

  /**
   * キューIDを生成する
   */
  private generateQueueId(): string {
    return `queue-${Date.now()}-${++this.queueIdCounter}`;
  }
}
