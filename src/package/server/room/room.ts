import type { Message } from "@/submodule/suit/types/message/message";
import { Player } from "../../core/class/Player";
import { Core } from "../../core/core";
import { Unit } from "@/package/core/class/card";
import type { SyncPayload } from "@/submodule/suit/types/message/payload/client";
import type { ServerWebSocket } from "bun";


export class Room {
  id = crypto.randomUUID();
  name: string;
  core: Core;
  players: Map<string, Player> = new Map<string, Player>();
  clients: Map<string, ServerWebSocket> = new Map<string, ServerWebSocket>();

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
      const player = new Player(message.payload.player);

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
  sync = () => {
    console.log('syncing')
    const players: { [key: string]: Player } = this.core.players.reduce((acc, player) => {
      acc[player.id] = player;
      return acc;
    }, {} as { [key: string]: Player })

    this.clients.forEach((client) => {
      console.log('Sending: ', client)
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
      console.log(data)
      client.send(data)
    })
  }
}