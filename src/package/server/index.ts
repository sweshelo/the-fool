import { Room } from './room/room';
import { User } from './room/user';
import { apiRouter } from './apiRouter';
import type { Message } from '@/submodule/suit/types/message/message';
import type { RequestPayload } from '@/submodule/suit/types/message/payload/base';
import type {
  RoomOpenResponsePayload,
  MatchingStartRequestPayload,
  MatchingStartResponsePayload,
  MatchingCancelResponsePayload,
} from '@/submodule/suit/types/message/payload/server';
import type {
  PlayerDisconnectedPayload,
  ErrorPayload,
  MatchingSuccessPayload,
  MatchingStatusPayload,
} from '@/submodule/suit/types/message/payload/client';
import { ErrorCode } from '@/submodule/suit/constant/error';
import type { ServerWebSocket } from 'bun';
import { MessageHelper } from '../core/helpers/message';
import { MatchingManager, getModeConfig } from './matching';
import { PlayCreditService } from '@/package/server/credits';
import type { MatchingMode, QueuedPlayer, MatchResult } from './matching';
import { config } from '@/config';
import type { Rule } from '@/submodule/suit/types';
import { info, error as logError } from '@/package/console-logger';

class ServerError extends Error {
  constructor(
    message: string,
    public errorCode: ErrorCode = ErrorCode.SYS_INTERNAL_ERROR
  ) {
    super(message);
    this.name = 'ServerError';
  }
}

export class Server {
  /** Static instance reference for sandbox API access */
  private static instance: Server | null = null;

  private rooms: Map<string, Room> = new Map(); // roomId <-> Room
  private clientRooms: Map<ServerWebSocket, string> = new Map();
  private clients: Map<ServerWebSocket, User> = new Map();
  private matchingManager: MatchingManager = new MatchingManager();
  private creditService = new PlayCreditService();

  constructor(port?: number) {
    Server.instance = this;
    const serverPort = port || process.env.PORT;
    info('Server', `PORT: ${serverPort}`);

    if (process.env.USE_TLS === 'true') {
      info('Server', 'Running server with TLS enabled');

      // Use Bun's built-in file reading capability with full path from project root
      const projectRoot = process.cwd();
      const keyPath = `${projectRoot}/certs/key.pem`;
      const certPath = `${projectRoot}/certs/cert.pem`;

      info('Server', `Key path: ${keyPath}`);
      info('Server', `Cert path: ${certPath}`);

      import('fs')
        .then(fs => {
          // Directly read the content of the files
          const keyContent = fs.readFileSync(keyPath, 'utf8');
          const certContent = fs.readFileSync(certPath, 'utf8');

          // Start server with TLS
          Bun.serve({
            port: serverPort,
            tls: {
              key: keyContent,
              cert: certContent,
            },
            fetch: async (req, server) => {
              const apiResponse = await apiRouter(req);
              if (apiResponse) return apiResponse;
              if (server.upgrade(req)) return;
              return new Response('Upgrade failed', { status: 500 });
            },
            websocket: {
              open: this.onOpen.bind(this),
              close: this.onClose.bind(this),
              message: this.onMessage.bind(this),
            },
          });
        })
        .catch(err => {
          logError('Server', 'Failed to read certificate files:', err);
          throw new Error('Unable to start TLS server due to certificate error');
        });
    } else {
      info('Server', 'Running server without TLS (HTTP mode)');
      Bun.serve({
        port: serverPort,
        fetch: async (req, server) => {
          const apiResponse = await apiRouter(req);
          if (apiResponse) return apiResponse;
          if (server.upgrade(req)) return;
          return new Response('Upgrade failed', { status: 500 });
        },
        websocket: {
          open: this.onOpen.bind(this),
          close: this.onClose.bind(this),
          message: this.onMessage.bind(this),
        },
      });
    }
  }

  private onOpen(ws: ServerWebSocket) {
    // 新しいユーザーを作成
    // TODO: 将来的には id と user の mapを用意して、再接続した際に同一ユーザと見做せるようにする
    const user = new User();
    this.clients.set(ws, user);
  }

  private onClose(ws: ServerWebSocket) {
    const roomId = this.clientRooms.get(ws);
    const disconnectedUser = this.clients.get(ws);

    // マッチングキューからも削除
    if (disconnectedUser) {
      const wasInQueue = this.matchingManager.leave(disconnectedUser.id);
      if (wasInQueue) {
        info('Matching', 'Player removed from queue on disconnect');
        // キューから削除されたので全クライアントにステータスを配信
        this.broadcastMatchingStatus();
      }
    }

    if (roomId && disconnectedUser) {
      const room = this.rooms.get(roomId);

      if (room) {
        // 既にルームから退室済みの場合は通知しない（LeaveRoomRequest で退室済み）
        const isStillInRoom =
          disconnectedUser.playerId && room.clients.has(disconnectedUser.playerId);

        if (isStillInRoom) {
          // 1. 切断通知を先に送信（clients から削除する前に）
          // roomWillClose は自分が最後のプレイヤーかどうかで判定
          const roomWillClose = room.clients.size === 1;

          const payload: PlayerDisconnectedPayload = {
            type: 'PlayerDisconnected',
            disconnectedPlayerId: disconnectedUser.playerId ?? disconnectedUser.id,
            reason: 'connection_lost',
            timestamp: Date.now(),
            roomWillClose,
          };

          room.broadcastToAllExcept(
            {
              action: { handler: 'client', type: 'disconnected' },
              payload,
            },
            disconnectedUser.playerId ?? disconnectedUser.id
          );

          // 2. playerId が設定されている場合のみ clients から削除
          // room.players は削除しない（再接続時にプレイヤーを特定するため）
          if (disconnectedUser.playerId) room.clients.delete(disconnectedUser.playerId);

          // 3. Roomが空になったらログ記録と削除
          if (room.clients.size === 0) {
            // 最後のプレイヤーが切断 → ログ記録
            const winnerIndex = room.core.players.findIndex(
              p => p.id === disconnectedUser.playerId
            );
            room.logger
              .logMatchEnd(room.core, winnerIndex === -1 ? null : winnerIndex, 'aborted')
              .catch(console.error);

            room.dispose().catch(console.error);
            this.rooms.delete(roomId);
            info('Room', 'room %s has been deleted.', roomId);
          }
        }
      }

      // Serverの管理マップからクリーンアップ
      this.clientRooms.delete(ws);
      this.clients.delete(ws);
    } else {
      // roomIdまたはdisconnectedUserが存在しない場合もクリーンアップ
      this.clients.delete(ws);
    }
  }

  private onMessage(ws: ServerWebSocket, data: string) {
    try {
      const message: Message = JSON.parse(data);
      this.handleMessage(ws, message);
    } catch (error) {
      logError('Server', 'Invalid message format:', error);

      // JSONパースエラーの場合は適切なエラーコードを送信
      const errorPayload: ErrorPayload = {
        type: 'Error',
        errorCode: ErrorCode.CONN_INVALID_MESSAGE,
        message: '無効なメッセージ形式です',
        details: error instanceof Error ? { error: error.message } : undefined,
        timestamp: Date.now(),
      };

      ws.send(
        JSON.stringify({
          action: {
            handler: 'client',
            type: 'error',
          },
          payload: errorPayload,
        })
      );
    }
  }

  private getRoom(client: ServerWebSocket) {
    const roomId = this.clientRooms.get(client);
    if (!roomId)
      throw new ServerError(
        '参加していないルームに対する操作が試みられました。',
        ErrorCode.ROOM_NOT_FOUND
      );

    const room = this.rooms.get(roomId);
    if (!room) throw new ServerError('ルームが見つかりませんでした。', ErrorCode.ROOM_NOT_FOUND);

    return room;
  }

  public responseJustBoolean<T extends RequestPayload>(
    client: ServerWebSocket,
    message: Message<T>,
    result: boolean
  ) {
    const response = {
      action: {
        type: 'response',
        handler: 'client',
      },
      payload: {
        requestId: message.payload.requestId,
        result,
      },
    };
    client.send(JSON.stringify(response));
  }

  private handleMessage(client: ServerWebSocket, message: Message) {
    try {
      const { payload } = message;
      switch (message.action.handler) {
        case 'room':
          if ('roomId' in payload && typeof payload.roomId === 'string') {
            // FIXME: action.handlerがroomならpayload.roomIdが必ず存在するような型定義にすれば良いのでは?
            const room = this.rooms.get(payload.roomId);
            if (!room)
              throw new ServerError(
                `ルームが見つかりませんでした: ${payload.roomId}`,
                ErrorCode.ROOM_NOT_FOUND
              );

            // 参加処理だけServer側で登録処理を走らせる
            if (message.payload.type === 'PlayerEntry') {
              const result = room.join(client, message);
              if (result) {
                this.clientRooms.delete(client);
                this.clientRooms.set(client, room.id);
                // User に playerId を設定
                const user = this.clients.get(client);
                if (user) {
                  user.playerId = message.payload.player.id;
                }
              } else {
                throw new ServerError('ルームの参加に失敗しました', ErrorCode.ROOM_FULL);
              }
            } else if (message.payload.type === 'LeaveRoomRequest') {
              // ゲーム終了後の退室処理
              this.handleLeaveRoom(client, room);
            } else {
              room.handleMessage(client, message);
            }
          }
          break;
        case 'core':
          const room = this.getRoom(client);
          // oxlint-disable-next-line no-floating-promises
          room?.core.handleMessage(message).catch(e => {
            logError('Server', 'メッセージハンドリング中にエラーが発生しました。', e);
            room.broadcastToPlayer(room.core.getTurnPlayer().id, MessageHelper.defrost());
          });
          break;
        case 'server':
        default:
          this.handleMessageForServer(client, message);
      }
    } catch (e) {
      logError('Server', 'Error handling message:', e);

      let errorCode: ErrorCode;
      let message: string;
      let details: Record<string, unknown> | undefined;

      if (e instanceof ServerError) {
        // ServerErrorの場合は指定されたエラーコードを使用
        errorCode = e.errorCode;
        message = e.message;
      } else if (e instanceof Error) {
        // 通常のErrorの場合はInternal Error
        errorCode = ErrorCode.SYS_INTERNAL_ERROR;
        message = e.message;
      } else {
        // その他の場合はUnknown Error
        errorCode = ErrorCode.SYS_UNKNOWN_ERROR;
        message = '想定外の事象が発生しました。';
        details = { body: e };
      }

      const errorPayload: ErrorPayload = {
        type: 'Error',
        errorCode,
        message,
        details,
        timestamp: Date.now(),
      };

      client.send(
        JSON.stringify({
          action: {
            handler: 'client',
            type: 'error',
          },
          payload: errorPayload,
        })
      );
    }
  }

  private handleMessageForServer(client: ServerWebSocket, message: Message) {
    const { payload } = message;
    switch (message.action.type) {
      case 'open': {
        if (payload.type === 'RoomOpenRequest') {
          const room = new Room(payload.name, payload.rule);
          this.rooms.set(room.id, room);
          this.clientRooms.set(client, room.id);

          // ルーム作成ログを記録
          const user = this.clients.get(client);
          room.logger.logRoomCreation(room.id, room.name, room.rule, user?.id).catch(console.error);

          const response = {
            action: {
              type: 'response',
              handler: 'client',
            },
            payload: {
              type: 'RoomOpenResponse',
              requestId: payload.requestId,
              roomId: room.id,
              result: true,
            },
          } satisfies Message<RoomOpenResponsePayload>;
          client.send(JSON.stringify(response));
        }
        break;
      }
      case 'matching-start': {
        if (payload.type === 'MatchingStartRequest') {
          // oxlint-disable-next-line no-unsafe-type-assertion
          this.handleMatchingStart(client, message as Message<MatchingStartRequestPayload>).catch(
            e => {
              logError('Matching', 'Error during matching start:', e);
              this.sendError(
                client,
                ErrorCode.SYS_INTERNAL_ERROR,
                'マッチング処理中にエラーが発生しました'
              );
            }
          );
        }
        break;
      }
      case 'matching-cancel': {
        if (payload.type === 'MatchingCancelRequest') {
          // oxlint-disable-next-line no-unsafe-type-assertion
          this.handleMatchingCancel(client, message as Message<RequestPayload>);
        }
        break;
      }
      case 'matchingStatus': {
        // マッチングステータスを送信
        this.sendMatchingStatusTo(client);
        break;
      }
      case 'list':
    }
  }

  /**
   * マッチング開始リクエストを処理する
   */
  private async handleMatchingStart(
    client: ServerWebSocket,
    message: Message<MatchingStartRequestPayload>
  ) {
    const payload = message.payload;
    const user = this.clients.get(client);

    if (!user) {
      this.sendError(client, ErrorCode.SYS_INTERNAL_ERROR, 'ユーザーが見つかりません');
      return;
    }

    // プレイ可否チェック（キュー参加前）
    const eligibility = await this.creditService.checkEligibility(payload.player.id);
    if (!eligibility.canPlay) {
      this.sendError(
        client,
        ErrorCode.MATCHING_INSUFFICIENT_CREDITS,
        eligibility.reason ?? 'プレイ可能回数が不足しています'
      );
      return;
    }

    const queuedPlayer: QueuedPlayer = {
      id: user.id,
      socket: client,
      player: payload.player,
      queuedAt: Date.now(),
    };

    const result = this.matchingManager.join(payload.mode, queuedPlayer);

    if (!result.success) {
      // エラーレスポンス
      const errorMessages: Record<string, string> = {
        already_in_queue: '既にマッチングキューに参加しています',
        invalid_deck_size: 'デッキは40枚である必要があります',
        card_not_found: '存在しないカードがデッキに含まれています',
        card_restriction_violation: 'このモードで使用できないカードが含まれています',
        deck_restriction_violation: 'デッキが制限条件を満たしていません',
      };
      this.sendError(
        client,
        ErrorCode.MATCHING_INVALID_DECK,
        errorMessages[result.error] ?? 'マッチングに失敗しました',
        result.invalidCards ? { invalidCards: result.invalidCards } : undefined
      );
      return;
    }

    if (result.matched) {
      // マッチング成立 - ルーム作成
      this.createRoomForMatch(payload.mode, result.matchResult);
      // マッチング成立後、キューが変更されたので配信
      this.broadcastMatchingStatus();
    } else {
      // キュー参加確認レスポンス
      const response: Message<MatchingStartResponsePayload> = {
        action: {
          type: 'response',
          handler: 'client',
        },
        payload: {
          type: 'MatchingStartResponse',
          requestId: payload.requestId,
          result: true,
          queueId: result.queueId,
          position: result.position,
        },
      };
      client.send(JSON.stringify(response));
      // キュー参加後、キューが変更されたので配信
      this.broadcastMatchingStatus();
    }
  }

  /**
   * マッチングキャンセルリクエストを処理する
   */
  private handleMatchingCancel(client: ServerWebSocket, message: Message<RequestPayload>) {
    const user = this.clients.get(client);

    if (!user) {
      this.sendError(client, ErrorCode.SYS_INTERNAL_ERROR, 'ユーザーが見つかりません');
      return;
    }

    const left = this.matchingManager.leave(user.id);

    const response: Message<MatchingCancelResponsePayload> = {
      action: {
        type: 'response',
        handler: 'client',
      },
      payload: {
        type: 'MatchingCancelResponse',
        requestId: message.payload.requestId,
        result: left,
      },
    };
    client.send(JSON.stringify(response));

    // キャンセル成功時、キューが変更されたので配信
    if (left) {
      this.broadcastMatchingStatus();
    }
  }

  /**
   * マッチング成立時にルームを作成し、両プレイヤーに通知する
   * 実際の参加処理はクライアントからの PlayerEntry を待つ
   */
  private createRoomForMatch(mode: MatchingMode, matchResult: MatchResult) {
    const { player1, player2 } = matchResult;
    const modeConfig = getModeConfig(mode);

    // ルールを作成（デフォルトルール + モードのオーバーライド）
    const rule: Rule = {
      ...config.game,
      ...modeConfig.ruleOverrides,
      joker: {
        ...config.game.joker,
        ...modeConfig.ruleOverrides.joker,
      },
    };

    // ルーム作成
    const room = new Room(`Matching: ${mode}`, rule);
    room.matchingMode = mode;
    this.rooms.set(room.id, room);

    // ルーム作成ログを記録
    room.logger.logRoomCreation(room.id, room.name, room.rule, player1.id).catch(console.error);

    // 両プレイヤーにマッチング成功通知を送信
    const sendMatchingSuccess = (player: QueuedPlayer, opponent: QueuedPlayer) => {
      const successPayload: MatchingSuccessPayload = {
        type: 'MatchingSuccess',
        roomId: room.id,
        opponentName: opponent.player.name,
        mode,
      };

      const successMessage: Message<MatchingSuccessPayload> = {
        action: {
          type: 'matching-success',
          handler: 'client',
        },
        payload: successPayload,
      };

      player.socket.send(JSON.stringify(successMessage));
    };

    sendMatchingSuccess(player1, player2);
    sendMatchingSuccess(player2, player1);

    // クライアントの roomId マッピングを設定
    // 実際の join はクライアントからの PlayerEntry を待つ
    this.clientRooms.set(player1.socket, room.id);
    this.clientRooms.set(player2.socket, room.id);

    info(
      'Matching',
      'Match created: mode=%s, room=%s, %s vs %s',
      mode,
      room.id,
      player1.player.name,
      player2.player.name
    );
  }

  /**
   * ルーム退室処理
   * ゲーム終了後にクライアントがクリーンに退室するための処理
   * 退室済みのプレイヤーには切断通知が送信されない
   */
  private handleLeaveRoom(client: ServerWebSocket, room: Room) {
    const user = this.clients.get(client);
    if (!user?.playerId) return;

    // クライアントマップから削除（切断通知が送られないようにする）
    room.clients.delete(user.playerId);
    this.clientRooms.delete(client);

    info('Room', `Player ${user.playerId} left room ${room.id} cleanly.`);

    // ルームが空になったら破棄
    if (room.clients.size === 0) {
      room.dispose().catch(console.error);
      this.rooms.delete(room.id);
      info('Room', 'room %s has been deleted (all players left).', room.id);
    }
  }

  /**
   * エラーメッセージを送信する
   */
  private sendError(
    client: ServerWebSocket,
    errorCode: ErrorCode,
    errorMessage: string,
    details?: Record<string, unknown>
  ) {
    const errorPayload: ErrorPayload = {
      type: 'Error',
      errorCode,
      message: errorMessage,
      details,
      timestamp: Date.now(),
    };

    client.send(
      JSON.stringify({
        action: {
          handler: 'client',
          type: 'error',
        },
        payload: errorPayload,
      })
    );
  }

  /**
   * 全クライアントにマッチング待機状況を配信する
   */
  private broadcastMatchingStatus() {
    const queues = this.matchingManager.getAllQueueSizes();

    const payload: MatchingStatusPayload = {
      type: 'MatchingStatus',
      queues,
      timestamp: Date.now(),
    };

    const message: Message<MatchingStatusPayload> = {
      action: {
        type: 'matching-status',
        handler: 'client',
      },
      payload,
    };

    const messageStr = JSON.stringify(message);

    for (const client of this.clients.keys()) {
      if (client.readyState === 1) {
        // WebSocket.OPEN
        client.send(messageStr);
      }
    }
  }

  /**
   * 特定のクライアントにマッチング待機状況を送信する
   */
  private sendMatchingStatusTo(client: ServerWebSocket) {
    if (client.readyState !== 1) return; // WebSocket.OPEN

    const queues = this.matchingManager.getAllQueueSizes();

    const payload: MatchingStatusPayload = {
      type: 'MatchingStatus',
      queues,
      timestamp: Date.now(),
    };

    const message: Message<MatchingStatusPayload> = {
      action: {
        type: 'matching-status',
        handler: 'client',
      },
      payload,
    };

    client.send(JSON.stringify(message));
  }

  /**
   * Register a room in the server's rooms map (for sandbox)
   */
  static registerRoom(room: Room): boolean {
    if (!Server.instance) {
      logError('Server', 'No server instance available');
      return false;
    }
    Server.instance.rooms.set(room.id, room);
    info('Server', `Room ${room.id} registered`);
    return true;
  }

  /**
   * Unregister a room from the server's rooms map (for sandbox)
   */
  static unregisterRoom(roomId: string): boolean {
    if (!Server.instance) {
      logError('Server', 'No server instance available');
      return false;
    }
    const room = Server.instance.rooms.get(roomId);
    if (room) {
      room.dispose().catch(console.error);
    }
    const deleted = Server.instance.rooms.delete(roomId);
    if (deleted) {
      info('Server', `Room ${roomId} unregistered`);
    }
    return deleted;
  }
}
