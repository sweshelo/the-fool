import type { PrismaClient, Prisma } from '@prisma/client';
import type { ServerWebSocket } from 'bun';
import type { Rule } from '@/submodule/suit/types/rule';
import { ErrorCode } from '@/submodule/suit/constant/error';

// Matching mode types
type MatchingMode = 'RANDOM' | 'RATING' | 'RULE';
// type MatchingStatus = 'WAITING' | 'MATCHED' | 'CANCELLED' | 'EXPIRED';
// type EntryStatus = 'ACTIVE' | 'MATCHED' | 'CANCELLED';

// Prisma transaction client type
type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// QueueEntry with User relation (from findMany with include)
type QueueEntryWithUser = Prisma.MatchingQueueEntryGetPayload<{
  include: { user: true };
}>;

// Room interface (minimal, to avoid circular reference)
interface RoomInstance {
  id: string;
}

// Server interface (to avoid circular reference)
interface ServerInstance {
  rooms: Map<string, RoomInstance>;
}

class MatchingError extends Error {
  constructor(
    message: string,
    public errorCode: ErrorCode = ErrorCode.SYS_INTERNAL_ERROR
  ) {
    super(message);
    this.name = 'MatchingError';
  }
}

interface MatchingCriteria {
  rating?: number;
  rulePreference?: Rule;
  deck: string[];
  jokersOwned?: string[];
}

interface Match {
  player1: {
    userId: string;
    entryId: string;
    criteria: MatchingCriteria;
  };
  player2: {
    userId: string;
    entryId: string;
    criteria: MatchingCriteria;
  };
}

export class MatchingService {
  private prisma: PrismaClient;
  private userSockets: Map<string, ServerWebSocket> = new Map();
  private matchingIntervals: Map<MatchingMode, Timer> = new Map();
  private cleanupInterval: Timer | null = null;
  private server: ServerInstance;

  constructor(prisma: PrismaClient, server: ServerInstance) {
    this.prisma = prisma;
    this.server = server;
    this.startMatchingLoop();
    this.startCleanupLoop();
  }

  /**
   * マッチングキューに参加
   */
  async joinQueue(
    userId: string,
    socket: ServerWebSocket,
    mode: MatchingMode,
    criteria: MatchingCriteria
  ): Promise<string> {
    // 既にキューに参加していないかチェック
    const existing = await this.prisma.matchingQueueEntry.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (existing) {
      throw new MatchingError(
        '既にマッチングキューに参加しています',
        ErrorCode.MATCHING_ALREADY_QUEUED
      );
    }

    // トランザクションで Queue と Entry を作成
    const result = await this.prisma.$transaction(async (tx: TransactionClient) => {
      // ユーザーが存在するか確認し、存在しない場合は作成
      await tx.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          username: `User_${userId.substring(0, 8)}`,
          rating: 1500,
        },
      });

      // 適切なキューを検索または作成
      let queue = await this.findSuitableQueue(mode, criteria, tx);

      if (!queue) {
        // 新しいキューを作成
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分後にタイムアウト

        queue = await tx.matchingQueue.create({
          data: {
            mode,
            status: 'WAITING',
            minRating: mode === 'RATING' ? (criteria.rating || 1500) - 200 : null,
            maxRating: mode === 'RATING' ? (criteria.rating || 1500) + 200 : null,
            rulePreference:
              mode === 'RULE' && criteria.rulePreference
                ? JSON.stringify(criteria.rulePreference)
                : null,
            expiresAt,
          },
        });
      }

      // キューエントリーを作成
      await tx.matchingQueueEntry.create({
        data: {
          queueId: queue.id,
          userId,
          status: 'ACTIVE',
        },
      });

      return queue.id;
    });

    // ユーザーのWebSocketを保存
    this.userSockets.set(userId, socket);

    console.log(`User ${userId} joined ${mode} matching queue: ${result}`);

    return result;
  }

  /**
   * マッチングをキャンセル
   */
  async cancelMatching(userId: string, queueId: string): Promise<void> {
    await this.prisma.$transaction(async (tx: TransactionClient) => {
      // エントリーのステータスをCANCELLEDに更新
      const updateResult = await tx.matchingQueueEntry.updateMany({
        where: { userId, queueId, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      });

      if (updateResult.count === 0) {
        throw new MatchingError(
          'マッチングキューエントリーが見つかりません',
          ErrorCode.MATCHING_QUEUE_NOT_FOUND
        );
      }

      // キューに残っているACTIVEエントリーを確認
      const remainingCount = await tx.matchingQueueEntry.count({
        where: { queueId, status: 'ACTIVE' },
      });

      // 空になったキューをキャンセル
      if (remainingCount === 0) {
        await tx.matchingQueue.update({
          where: { id: queueId },
          data: { status: 'CANCELLED' },
        });
      }
    });

    // WebSocketマップから削除
    this.userSockets.delete(userId);

    console.log(`User ${userId} cancelled matching in queue ${queueId}`);
  }

  /**
   * 定期的なマッチング処理を開始（3秒ごと）
   */
  private startMatchingLoop(): void {
    const modes: MatchingMode[] = ['RANDOM', 'RATING', 'RULE'];

    for (const mode of modes) {
      const interval = setInterval(async () => {
        try {
          await this.tryMatchmaking(mode);
        } catch (error) {
          console.error(`Error in ${mode} matchmaking:`, error);
        }
      }, 3000);

      this.matchingIntervals.set(mode, interval);
    }

    console.log('Matching loops started for all modes');
  }

  /**
   * タイムアウトしたキューのクリーンアップを開始（30秒ごと）
   */
  private startCleanupLoop(): void {
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupExpiredQueues();
      } catch (error) {
        console.error('Error in cleanup loop:', error);
      }
    }, 30000);

    console.log('Cleanup loop started');
  }

  /**
   * マッチング試行
   */
  private async tryMatchmaking(mode: MatchingMode): Promise<void> {
    // WAITING状態のキューを取得
    const queues = await this.prisma.matchingQueue.findMany({
      where: {
        mode,
        status: 'WAITING',
      },
      include: {
        entries: {
          where: { status: 'ACTIVE' },
          include: { user: true },
        },
      },
    });

    for (const queue of queues) {
      // 2人以上のACTIVEエントリーがあるか確認
      if (queue.entries.length < 2) {
        continue;
      }

      // マッチングアルゴリズムを適用
      let match: Match | null = null;

      switch (mode) {
        case 'RANDOM':
          match = await this.matchRandom(queue.entries);
          break;
        case 'RATING':
          match = await this.matchByRating(queue.entries);
          break;
        case 'RULE':
          match = await this.matchByRule(queue.entries);
          break;
      }

      if (match) {
        console.log(`Match found in ${mode} queue:`, match);
        await this.processMatch(match, queue.id);
      }
    }
  }

  /**
   * マッチ成立時の処理
   */
  private async processMatch(match: Match, queueId: string): Promise<void> {
    try {
      // エントリーのステータスをMATCHEDに更新
      await this.prisma.$transaction(async (tx: TransactionClient) => {
        await tx.matchingQueueEntry.updateMany({
          where: {
            id: { in: [match.player1.entryId, match.player2.entryId] },
            status: 'ACTIVE',
          },
          data: { status: 'MATCHED' },
        });

        // キューのステータスをMATCHEDに更新
        await tx.matchingQueue.update({
          where: { id: queueId },
          data: { status: 'MATCHED' },
        });
      });

      // Roomを作成
      const room = await this.createMatchedRoom(match);

      // 両プレイヤーに通知
      const socket1 = this.userSockets.get(match.player1.userId);
      const socket2 = this.userSockets.get(match.player2.userId);

      if (socket1) {
        socket1.send(
          JSON.stringify({
            action: { handler: 'client', type: 'matchFound' },
            payload: {
              type: 'MatchFound',
              roomId: room.id,
              opponent: {
                id: match.player2.userId,
                name: 'Opponent', // TODO: ユーザー名を取得
                rating: match.player2.criteria.rating,
              },
            },
          })
        );
      }

      if (socket2) {
        socket2.send(
          JSON.stringify({
            action: { handler: 'client', type: 'matchFound' },
            payload: {
              type: 'MatchFound',
              roomId: room.id,
              opponent: {
                id: match.player1.userId,
                name: 'Opponent', // TODO: ユーザー名を取得
                rating: match.player1.criteria.rating,
              },
            },
          })
        );
      }

      console.log(`Match processed successfully. Room ${room.id} created.`);
    } catch (error) {
      console.error('Error processing match:', error);
      throw error;
    }
  }

  /**
   * ランダムマッチング（FIFO）
   */
  private async matchRandom(entries: QueueEntryWithUser[]): Promise<Match | null> {
    if (entries.length < 2) return null;

    // 参加時刻順にソート
    entries.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());

    const player1 = entries[0];
    const player2 = entries[1];

    if (!player1 || !player2) return null;

    return {
      player1: {
        userId: player1.userId,
        entryId: player1.id,
        criteria: { deck: [] }, // デフォルト値
      },
      player2: {
        userId: player2.userId,
        entryId: player2.id,
        criteria: { deck: [] }, // デフォルト値
      },
    };
  }

  /**
   * レーティングマッチング
   */
  private async matchByRating(entries: QueueEntryWithUser[]): Promise<Match | null> {
    if (entries.length < 2) return null;

    // 待機時間順にソート（古い順）
    entries.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());

    for (let i = 0; i < entries.length - 1; i++) {
      const player1 = entries[i];
      if (!player1) continue;

      const player1Rating = player1.user.rating;

      // 待機時間に基づいて範囲を拡大
      const waitTime = Date.now() - player1.joinedAt.getTime();
      const rangeExpansion = Math.floor(waitTime / 30000) * 50; // 30秒ごとに±50拡大
      const minRating = player1Rating - 200 - rangeExpansion;
      const maxRating = player1Rating + 200 + rangeExpansion;

      // 範囲内の相手を探す
      for (let j = i + 1; j < entries.length; j++) {
        const player2 = entries[j];
        if (!player2) continue;

        const player2Rating = player2.user.rating;

        if (player2Rating >= minRating && player2Rating <= maxRating) {
          return {
            player1: {
              userId: player1.userId,
              entryId: player1.id,
              criteria: { rating: player1Rating, deck: [] },
            },
            player2: {
              userId: player2.userId,
              entryId: player2.id,
              criteria: { rating: player2Rating, deck: [] },
            },
          };
        }
      }
    }

    return null;
  }

  /**
   * ルールマッチング
   */
  private async matchByRule(entries: QueueEntryWithUser[]): Promise<Match | null> {
    if (entries.length < 2) return null;

    // ルール設定でグループ化
    const ruleGroups = new Map<string, QueueEntryWithUser[]>();

    for (const entry of entries) {
      const queue = await this.prisma.matchingQueue.findUnique({
        where: { id: entry.queueId },
      });

      if (!queue) continue;

      const ruleHash = queue.rulePreference || 'default';

      if (!ruleGroups.has(ruleHash)) {
        ruleGroups.set(ruleHash, []);
      }

      ruleGroups.get(ruleHash)!.push(entry);
    }

    // 2人以上いるグループを探す
    for (const group of ruleGroups.values()) {
      if (group.length >= 2) {
        group.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());

        const player1 = group[0];
        const player2 = group[1];

        if (!player1 || !player2) continue;

        return {
          player1: {
            userId: player1.userId,
            entryId: player1.id,
            criteria: { deck: [] },
          },
          player2: {
            userId: player2.userId,
            entryId: player2.id,
            criteria: { deck: [] },
          },
        };
      }
    }

    return null;
  }

  /**
   * マッチ成立時のRoom作成
   */
  private async createMatchedRoom(match: Match): Promise<{ id: string }> {
    const { Room } = await import('../room/room');

    // マッチング経由のルームは「Match」という名前で、ACTIVE状態で開始
    const room = new Room('Match', undefined, 'ACTIVE');

    // ServerのroomsMapに追加
    this.server.rooms.set(room.id, room);

    console.log(
      `Created matched room ${room.id} for players ${match.player1.userId} and ${match.player2.userId}`
    );

    return room;
  }

  /**
   * タイムアウトしたキューのクリーンアップ
   */
  private async cleanupExpiredQueues(): Promise<void> {
    const expired = await this.prisma.matchingQueue.findMany({
      where: {
        status: 'WAITING',
        expiresAt: { lt: new Date() },
      },
      include: {
        entries: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    for (const queue of expired) {
      // キューのステータスをEXPIREDに更新
      await this.prisma.matchingQueue.update({
        where: { id: queue.id },
        data: { status: 'EXPIRED' },
      });

      // 全てのエントリーをCANCELLEDに更新
      await this.prisma.matchingQueueEntry.updateMany({
        where: { queueId: queue.id, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      });

      // ユーザーに通知
      for (const entry of queue.entries) {
        const socket = this.userSockets.get(entry.userId);
        if (socket) {
          socket.send(
            JSON.stringify({
              action: { handler: 'client', type: 'matchingStatus' },
              payload: {
                type: 'MatchingStatus',
                queueId: queue.id,
                status: 'expired',
              },
            })
          );
        }
        this.userSockets.delete(entry.userId);
      }

      console.log(`Expired queue ${queue.id} cleaned up`);
    }
  }

  /**
   * 適切なキューを検索
   */
  private async findSuitableQueue(
    mode: MatchingMode,
    criteria: MatchingCriteria,
    tx: TransactionClient
  ): Promise<{ id: string } | null> {
    // WAITING状態のキューを検索
    const queues = await tx.matchingQueue.findMany({
      where: {
        mode,
        status: 'WAITING',
        expiresAt: { gt: new Date() },
      },
      include: {
        entries: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    // エントリー数が1のキューを優先（すぐにマッチング可能）
    for (const queue of queues) {
      if (queue.entries.length === 1) {
        return queue;
      }
    }

    return null;
  }

  /**
   * サービスのシャットダウン
   */
  shutdown(): void {
    // 全てのインターバルをクリア
    for (const interval of this.matchingIntervals.values()) {
      clearInterval(interval);
    }
    this.matchingIntervals.clear();

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    console.log('MatchingService shut down');
  }
}
