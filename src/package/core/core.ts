import type { Message } from "../server/message";
import type { Player } from "./class/Player";

export class Core {
  id: string;
  players: Player[];
  round: number = 0;
  turn: number = 0;

  constructor() {
    this.id = crypto.randomUUID()
    this.players = [];
  }

  entry(player: Player) {
    this.players.push(player)
  }

  async start() {
    for (this.round = 1; this.round <= 10; this.round++) {
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

  handleMessage(message: Message){
    console.log('passed message to Core : type<%s>', message.action.type)
  }
}