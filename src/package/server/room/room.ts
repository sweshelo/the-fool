import type { Message } from "@/submodule/suit/types/message/message";
import { Player } from "../../core/class/Player";
import { Core } from "../../core/core";
import { Unit } from "@/package/core/class/card";
import type { SyncPayload } from "@/submodule/suit/types/message/payload/client";
import { WebSocket } from "ws";

export class Room {
  id = crypto.randomUUID();
  name: string;
  core: Core;
  players: Map<string, Player> = new Map<string, Player>();
  clients: Map<string, WebSocket> = new Map<string, WebSocket>();

  constructor(name: string) {
    this.core = new Core();
    this.name = name;
  }

  // メッセージを処理
  handleMessage(socket: WebSocket, message: Message) {
    console.log('handling message on Room: %s', message.action.type)
    switch (message.action.type) {
      case 'join':
        this.join(socket, message)
    }
  }

  // プレイヤー参加処理
  join(socket: WebSocket, message: Message) {
    if (this.core.players.length < 2 && message.payload.type === 'PlayerEntry') {
      const cards = message.payload.player.deck.map(ref => new Unit(ref));
      const player = new Player(message.payload.player.id, message.payload.player.name, cards);

      // socket 登録
      this.clients.set(player.id, socket);
      this.core.entry(player);
      this.players.set(player.id, player)
      this.sync();
      return true
    } else {
      return false
    }
  }

  // ゲーム開始
  start() {
    this.core.start();
  }

  // 現在のステータスを全て送信
  sync() {
    const players: { [key: string]: Player } = this.core.players.reduce((acc, player) => {
      acc[player.id] = player;
      return acc;
    }, {} as { [key: string]: Player })

    this.clients.forEach((client) => {
      console.log('Sending')
      client.send(JSON.stringify({
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
      } satisfies Message<SyncPayload>))
    })
  }
}