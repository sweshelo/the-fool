import { WebSocket, WebSocketServer } from "ws";
import { Room } from "./room/room";
import { User } from "./room/user";
import type { Message } from "./message";

export class Server {
  private wss: WebSocketServer;
  private rooms: Map<string, Room> = new Map();
  private clientRooms: Map<WebSocket, string> = new Map();
  private clients: Map<WebSocket, User> = new Map();

  constructor(port: number = 3000) {
    console.log(`PORT: ${port}`)
    this.wss = new WebSocketServer({ port });
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

  private handleMessage(client: WebSocket, message: Message) {
    switch (message.action) {
      default:
        console.log(message)
    }
  }

}
