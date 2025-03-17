import { WebSocket, WebSocketServer } from "ws";
import { Room } from "./room/room";
import { User } from "./room/user";
import type { Message, PlayerEntryPayload, RequestPayload } from "./message";
import { config } from "../../config";

class ServerError extends Error { }

export class Server {
  private wss: WebSocketServer;
  private rooms: Map<string, Room> = new Map();
  private clientRooms: Map<WebSocket, string> = new Map();
  private clients: Map<WebSocket, User> = new Map();

  constructor(port?: number) {
    const serverPort = port || config.server.port;
    console.log(`PORT: ${serverPort}`);
    this.wss = new WebSocketServer({ port: serverPort });
    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected');

      // 新しいユーザーを作成
      const user = new User();
      this.clients.set(ws, user);

      // メッセージ受信ハンドラ
      ws.on('message', (data: string) => {
        try {
          const message: Message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Invalid message format:', error);
        }
      });

      // 切断ハンドラ
      ws.on('close', () => {
        const roomId = this.clientRooms.get(ws);
        if (roomId) {
          // ルームからの退出処理などを実装
          this.clientRooms.delete(ws);
        }
        this.clients.delete(ws);
        console.log('Client disconnected');
      });
    });
  }

  private getRoom(client: WebSocket) {
    const roomId = this.clientRooms.get(client);
    if (!roomId) throw new ServerError('参加していないルームに対する操作が試みられました。');

    const room = this.rooms.get(roomId)
    if (!room) throw new ServerError('ルームが見つかりませんでした。');

    return roomId ? this.rooms.get(roomId) : undefined
  }

  public responseJustBoolean<T extends RequestPayload>(client: WebSocket, message: Message<T>, result: boolean){
    const response = {
      action: {
        type: 'response',
        handler: 'client',
      },
      payload: {
        requestId: message.payload.requestId,
        result,
      }
    }
    client.send(JSON.stringify(response))
  }

  private handleMessage(client: WebSocket, message: Message) {
    try {
      switch (message.action.handler) {
        case 'room':
          this.getRoom(client)?.handleMessage(message);
          break;
        case 'core':
          this.getRoom(client)?.core.handleMessage(message);
          break;
        case 'server':
        default:
          this.handleMessageForServer(client, message);
      }
    } catch (e) {
      if (e instanceof Error) {
        client.send(JSON.stringify({
          action: {
            type: 'error',
          },
          payload: {
            error: e.message
          }
        }))
      } else {
        client.send(JSON.stringify({
          action: {
            type: 'error',
          },
          payload: {
            error: '想定外の事象が発生しました。',
            body: e
          }
        }))
      }
    }
  }

  private handleMessageForServer(client: WebSocket, message: Message) {
    switch (message.action.type) {
      case 'open':
        {
          console.log(message)
          const { payload } = message as Message<RequestPayload>
          if ('name' in payload && typeof payload.name === 'string') {
            const room = new Room(payload.name);
            this.rooms.set(room.id, room);
            this.clientRooms.set(client, room.id);

            const response = {
              action: {
                type: 'response',
                handler: 'client',
              },
              payload: {
                requestId: payload.requestId,
                roomId: room.id,
                result: true,
              }
            }
            client.send(JSON.stringify(response))
          }
          break;
        }
      case 'join':
        {
          const { payload } = message as Message<PlayerEntryPayload>
          if (this.rooms.get(payload.roomId)) {
            const room = this.rooms.get(payload.roomId)
            const result = room?.join(message as Message<PlayerEntryPayload>);
            this.responseJustBoolean(client, message as Message<PlayerEntryPayload>, result ?? false);
            console.log(result)
          }
        }
        break;
      case 'list':
    }
  }
}
