import { Room } from "./room/room";
import { User } from "./room/user";

import { config } from "../../config";
import type { Message } from "@/submodule/suit/types/message/message";
import type { RequestPayload } from "@/submodule/suit/types/message/payload/base";
import type { RoomOpenResponsePayload } from "@/submodule/suit/types/message/payload/server";
import type { ServerWebSocket } from "bun";

class ServerError extends Error { }

export class Server {
  private rooms: Map<string, Room> = new Map(); // roomId <-> Room
  private clientRooms: Map<ServerWebSocket, string> = new Map();
  private clients: Map<ServerWebSocket, User> = new Map();

  constructor(port?: number) {
    const serverPort = port || config.server.port;
    console.log(`PORT: ${serverPort}`);
    Bun.serve({
      port: serverPort,
      fetch(req, server) {
        if (server.upgrade(req)) return;
        return new Response("Upgrade failed", { status: 500 })
      },
      websocket: {
        open: this.onOpen.bind(this),
        close: this.onClose.bind(this),
        message: this.onMessage.bind(this),
      }
    })
  }

  private onOpen(ws: ServerWebSocket) {
    console.log('Client connected');

    // 新しいユーザーを作成
    // TODO: 将来的には id と user の mapを用意して、再接続した際に同一ユーザと見做せるようにする
    const user = new User();
    this.clients.set(ws, user);
  }

  private onClose(ws: ServerWebSocket) {
    const roomId = this.clientRooms.get(ws);
    if (roomId) {
      // ルームからの退出処理などを実装
      this.clientRooms.delete(ws);
    }
    this.clients.delete(ws);
    console.log('Client disconnected');
  }

  private onMessage(ws: ServerWebSocket, data: string) {
    try {
      const message: Message = JSON.parse(data);
      this.handleMessage(ws, message);
    } catch (error) {
      console.error('Invalid message format:', error);
    }
  }

  private getRoom(client: ServerWebSocket) {
    const roomId = this.clientRooms.get(client);
    if (!roomId) throw new ServerError('参加していないルームに対する操作が試みられました。');

    const room = this.rooms.get(roomId)
    if (!room) throw new ServerError('ルームが見つかりませんでした。');

    return roomId ? this.rooms.get(roomId) : undefined
  }

  public responseJustBoolean<T extends RequestPayload>(client: ServerWebSocket, message: Message<T>, result: boolean) {
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

  private handleMessage(client: ServerWebSocket, message: Message) {
    try {
      const { payload } = message;
      switch (message.action.handler) {
        case 'room':
          if ('roomId' in payload && typeof payload.roomId === 'string') { // FIXME: action.handlerがroomならpayload.roomIdが必ず存在するような型定義にすれば良いのでは?
            const room = this.rooms.get(payload.roomId)
            if (!room) throw new Error('ルームが見つかりませんでした')
            room.handleMessage(client, message);
          }
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
        console.error(e)
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

  private handleMessageForServer(client: ServerWebSocket, message: Message) {
    const { payload } = message;
    switch (message.action.type) {
      case 'open':
        {
          if (payload.type === 'RoomOpenRequest') {
            const room = new Room(payload.name);
            this.rooms.set(room.id, room);
            this.clientRooms.set(client, room.id);

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
              }
            } satisfies Message<RoomOpenResponsePayload>
            client.send(JSON.stringify(response))
          }
          break;
        }
      case 'join':
        {
          if (payload.type === 'PlayerEntry') {
            if (this.rooms.get(payload.roomId)) {
              const room = this.rooms.get(payload.roomId)
              const result = room?.join(client, message);
              // FIXME: 型定義を直す
              // this.responseJustBoolean(client, message, result ?? false);
            } else {
              throw new Error('対象のルームが見つかりませんでした')
            }
          }
        }
        break;
      case 'list':
    }
  }
}
