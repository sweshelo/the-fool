import { Unit } from "../../core/class/card/Unit";
import { Player } from "../../core/class/Player";
import { Core } from "../../core/core";
import type { Message } from "../message";

export class Room {
  id = crypto.randomUUID();
  name: string;
  core: Core
  private clients: Map<WebSocket, Player> = new Map();

  constructor(name: string) {
    this.core = new Core();
    this.name = name;
  }

  // メッセージを処理
  handleMessage(message: Message) {
    console.log('handling message on Room: %s', message.action.type)
  }

  // プレイヤー参加処理
  join(client: WebSocket) {
    const deck = ['0'] // 本当は40枚 - あとユーザから受け取るべき
    const cards = deck.map(ref => new Unit(ref));
    const player = new Player(cards);
    this.core.entry(player);

    this.clients.set(client, player);
  }

  // ゲーム開始
  start() {
    this.core.start();
  }
}