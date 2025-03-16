import { Unit } from "../../core/class/card/Unit";
import { Player } from "../../core/class/Player";
import { Core } from "../../core/core";

export class Room {
  id = crypto.randomUUID();
  core: Core

  constructor() {
    this.core = new Core();
  }

  // プレイヤー参加処理
  join(){
    const deck = ['0'] // 本当は40枚 - あとユーザから受け取るべき
    const cards = deck.map(ref => new Unit(ref));
    const player = new Player(cards);
    this.core.entry(player);
  }

  // ゲーム開始
  start(){
    this.core.start();
  }
}