import type { Message } from "@/submodule/suit/types/message/message";
import type { Player } from "./class/Player";
import { config } from "../../config";
import type { DebugDrawPayload } from "@/submodule/suit/types";
import type { Room } from "../server/room/room";

export class Core {
  id: string;
  players: Player[];
  round: number = 0;
  turn: number = 0;
  room: Room;

  constructor(room: Room) {
    this.id = crypto.randomUUID()
    this.players = [];
    this.room = room
  }

  entry(player: Player) {
    // 同じIDのプレイヤーが既に存在するか確認
    const existingPlayerIndex = this.players.findIndex(p => p.id === player.id);
    if (existingPlayerIndex >= 0) {
      console.log(`Player with ID ${player.id} already exists. Replacing.`);
      // 既存のプレイヤーを削除
      this.players.splice(existingPlayerIndex, 1);
    }
    // 新しいプレイヤーを追加
    this.players.push(player);
    console.log('Player added:', player.id);
  }

  async start() {
    for (this.round = 1; this.round <= config.game.system.round; this.round++) {
      console.log(`Round ${this.round}`);
      console.log(
        'Players:',
        this.players.map((p) => p.id),
      );

      for await (const player of this.players) {
        this.turn++;
        // TODO: ターン開始処理
        // ...
        console.log(player.draw());

        // TODO: ターン終了処理
        // ...
      }
    }
  }

  handleMessage(message: Message) {
    console.log('passed message to Core : type<%s>', message.action.type)
    switch (message.payload.type) {
      case 'DebugDraw': {
        const payload: DebugDrawPayload = message.payload
        const target = this.players.find(player => player.id === payload.player)
        if (target) {
          target.draw()
          this.room.sync()
        }
      }
    }
  }
}
