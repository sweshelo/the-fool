import { Room } from './room/room';
import { User } from './room/user';
import { apiRouter } from './apiRouter';
import type { Message } from '@/submodule/suit/types/message/message';
import type { RequestPayload } from '@/submodule/suit/types/message/payload/base';
import type { RoomOpenResponsePayload } from '@/submodule/suit/types/message/payload/server';
import type {
  PlayerDisconnectedPayload,
  ErrorPayload,
} from '@/submodule/suit/types/message/payload/client';
import { ErrorCode } from '@/submodule/suit/constant/error';
import type { ServerWebSocket } from 'bun';
import { MessageHelper } from '../core/helpers/message';

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

  constructor(port?: number) {
    Server.instance = this;
    const serverPort = port || process.env.PORT;
    console.log(`PORT: ${serverPort}`);

    if (process.env.USE_TLS === 'true') {
      console.log('Running server with TLS enabled');

      // Use Bun's built-in file reading capability with full path from project root
      const projectRoot = process.cwd();
      const keyPath = `${projectRoot}/certs/key.pem`;
      const certPath = `${projectRoot}/certs/cert.pem`;

      console.log(`Key path: ${keyPath}`);
      console.log(`Cert path: ${certPath}`);

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
          console.error('Failed to read certificate files:', err);
          throw new Error('Unable to start TLS server due to certificate error');
        });
    } else {
      console.log('Running server without TLS (HTTP mode)');
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

    if (roomId && disconnectedUser) {
      const room = this.rooms.get(roomId);

      if (room) {
        // playerId が設定されている場合のみ Room のマップから削除
        if (disconnectedUser.playerId) {
          room.clients.delete(disconnectedUser.playerId);
          room.players.delete(disconnectedUser.playerId);
        }

        // Roomの残りのクライアント数を基に閉じるかどうかを判定
        const roomWillClose = room.clients.size === 0;

        // 切断通知を他のプレイヤーに送信
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

        // Roomが空になったら削除
        if (roomWillClose) {
          room.dispose().catch(console.error);
          this.rooms.delete(roomId);
          console.log('room %s has been deleted.', roomId);
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
      console.error('Invalid message format:', error);

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
            } else {
              room.handleMessage(client, message);
            }
          }
          break;
        case 'core':
          const room = this.getRoom(client);
          // oxlint-disable-next-line no-floating-promises
          room?.core.handleMessage(message).catch(e => {
            console.error('メッセージハンドリング中にエラーが発生しました。', e);
            room.broadcastToPlayer(room.core.getTurnPlayer().id, MessageHelper.defrost());
          });
          break;
        case 'server':
        default:
          this.handleMessageForServer(client, message);
      }
    } catch (e) {
      console.error(e);

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
      case 'list':
    }
  }

  /**
   * Register a room in the server's rooms map (for sandbox)
   */
  static registerRoom(room: Room): boolean {
    if (!Server.instance) {
      console.error('[Server] No server instance available');
      return false;
    }
    Server.instance.rooms.set(room.id, room);
    console.log(`[Server] Room ${room.id} registered`);
    return true;
  }

  /**
   * Unregister a room from the server's rooms map (for sandbox)
   */
  static unregisterRoom(roomId: string): boolean {
    if (!Server.instance) {
      console.error('[Server] No server instance available');
      return false;
    }
    const room = Server.instance.rooms.get(roomId);
    if (room) {
      room.dispose().catch(console.error);
    }
    const deleted = Server.instance.rooms.delete(roomId);
    if (deleted) {
      console.log(`[Server] Room ${roomId} unregistered`);
    }
    return deleted;
  }
}
