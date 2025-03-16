import { Unit } from "../../core/class/card/Unit";
import { Player } from "../../core/class/Player";
import { Core } from "../../core/core";
import type { Message, PlayerEntryPayload } from "../message";

export class Room {
  id = crypto.randomUUID();
  name: string;
  core: Core

  constructor(name: string) {
    this.core = new Core();
    this.name = name;
  }

  // メッセージを処理
  handleMessage(message: Message) {
    console.log('handling message on Room: %s', message.action.type)
    switch(message.action.type){
      case 'join':
        this.join(message as Message<PlayerEntryPayload>)
    }
  }

  // プレイヤー参加処理
  join(message: Message<PlayerEntryPayload>) {
    const cards = message.payload.deck.map(ref => new Unit(ref));
    const player = new Player(message.payload.player.id, message.payload.player.name, cards);
    this.core.entry(player);
  }

  // ゲーム開始
  start() {
    this.core.start();
  }
}