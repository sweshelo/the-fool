import type { Message } from "@/submodule/suit/types/message/message";
import { Player } from "../../core/class/Player";
import { Core } from "../../core/core";
import type { SyncPayload } from "@/submodule/suit/types/message/payload/client";
import type { BasePayload } from "@/submodule/suit/types/message/payload/base";
import type { ServerWebSocket } from "bun";
import type { Rule } from "@/submodule/suit/types";
import { config } from "@/config";


export class Room {
  id = crypto.randomUUID();
  name: string;
  core: Core;
  players: Map<string, Player> = new Map<string, Player>();
  clients: Map<string, ServerWebSocket> = new Map<string, ServerWebSocket>();
  rule: Rule = { ...config.game } // デフォルトのルールをコピー

  constructor(name: string) {
    this.core = new Core(this);
    this.name = name;
  }

  // メッセージを処理
  handleMessage(socket: ServerWebSocket, message: Message) {
    console.log('handling message on Room: %s', message.action.type)
    switch (message.action.type) {
      case 'join':
        this.join(socket, message)
    }
  }

  // プレイヤー参加処理
  join(socket: ServerWebSocket, message: Message) {
    if (this.core.players.length < 2 && message.payload.type === 'PlayerEntry') {
      // 再接続チェック
      const exists = this.players.get(message.payload.player.id)

      if (exists) {
        // clients再登録
        this.clients.delete(exists.id)
        this.clients.set(exists.id, socket);
        this.sync();
      } else {
        const player = new Player(message.payload.player);
        // socket 登録
        this.clients.set(player.id, socket);
        this.core.entry(player);
        this.players.set(player.id, player)
        this.sync();
      }
      return true
    } else {
      return false
    }
  }

  // ゲーム開始
  start() {
    this.core.start();
  }

  /**
   * 特定のプレイヤーにメッセージを送信する
   * @param playerId 送信先プレイヤーID
   * @param payload 送信するペイロード
   */
  broadcastToPlayer(playerId: string, payload: { type: string, payload: any }) {
    const client = this.clients.get(playerId);
    if (client) {
      const message: Message<BasePayload> = {
        action: {
          type: payload.type.toLowerCase(),
          handler: 'client',
        },
        payload: {
          type: payload.type,
          ...payload.payload
        } as any
      };

      client.send(JSON.stringify(message));
    } else {
      console.warn(`Failed to broadcast to player ${playerId}: Player not found`);
    }
  }

  /**
   * 全プレイヤーにメッセージを送信する
   * @param payload 送信するペイロード
   */
  broadcastToAll(payload: { type: string, payload: any }) {
    this.clients.forEach((client, playerId) => {
      const message: Message<BasePayload> = {
        action: {
          type: payload.type.toLowerCase(),
          handler: 'client',
        },
        payload: {
          type: payload.type,
          ...payload.payload
        } as any
      };

      client.send(JSON.stringify(message));
    });
  }

  // 現在のステータスを全て送信
  sync = () => {
    console.log('syncing')
    const players: { [key: string]: Player } = this.core.players.reduce((acc, player) => {
      acc[player.id] = player;
      return acc;
    }, {} as { [key: string]: Player })

    this.clients.forEach((client) => {
      const data = JSON.stringify({
        action: {
          type: 'sync',
          handler: 'client',
        },
        payload: {
          type: 'Sync',
          body: {
            game: {
              round: this.core.round,
              turn: this.core.turn,
            },
            players,
          }
        }
      } satisfies Message<SyncPayload>)
      client.send(data)
    })
  }
}
