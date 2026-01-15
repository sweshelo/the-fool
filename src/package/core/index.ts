import type { Message } from '@/submodule/suit/types/message/message';
import type { Player } from './class/Player';
import type { Room } from '../server/room/room';
import { Stack } from './class/stack';
import type { Card, Unit } from './class/card';

// Import operations
import * as effectHandler from './operations/effect-handler';
import * as stackResolver from './operations/stack-resolver';
import * as cardOperations from './operations/card-operations';
import * as battle from './operations/battle';
import * as gameFlow from './operations/game-flow';
import * as messageHandler from './operations/message-handler';

interface History {
  card: Card;
  generation: number;
  action: 'drive' | 'boot' | 'joker';
}

export class Core {
  id: string;
  players: Player[];
  round: number = 1;
  turn: number = 1;
  room: Room;
  stack: Stack[] = [];
  histories: History[];
  /** Core インスタンス固有の効果応答ハンドラマップ */
  effectResponses: Map<string, Function> = new Map();

  constructor(room: Room) {
    this.id = crypto.randomUUID();
    this.players = [];
    this.room = room;
    this.histories = [];
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
    this.room.broadcastToPlayer(player.id, {
      action: { type: 'operation', handler: 'client' },
      payload: { type: 'Operation', action: 'freeze' },
    });
    console.log('Player %s added in room %s', player.id, this.room.id);

    // 2人が揃ったら開始
    if (this.players.length >= 2) {
      this.room.soundEffect('agent-interrupt');
      // oxlint-disable-next-line no-floating-promises
      this.start();
    }
  }

  /**
   * 現在のターンプレイヤーのIDを取得する
   * @returns ターンプレイヤーのID
   */
  getTurnPlayer(): Player {
    // 現在のターン数から、対応するプレイヤーのインデックスを計算
    const playerIndex = (this.turn - 1) % this.players.length;
    const player = this.players[playerIndex];

    if (!player) throw new Error('ターンプレイヤーが見つかりませんでした');
    return player;
  }

  // Game flow methods
  async start() {
    return gameFlow.start(this);
  }

  async turnChange(isFirstTurn: boolean = false) {
    return gameFlow.turnChange(this, isFirstTurn);
  }

  async mulligan(player: Player): Promise<void> {
    return gameFlow.mulligan(this, player);
  }

  // Battle methods
  async attack(attacker: Unit) {
    return battle.attack(this, attacker);
  }

  async block(attacker: Unit): Promise<Unit | undefined> {
    return battle.block(this, attacker);
  }

  async preBattle(attacker: Unit, blocker: Unit) {
    return battle.preBattle(this, attacker, blocker);
  }

  async postBattle(attacker: Unit, blocker: Unit) {
    return battle.postBattle(this, attacker, blocker);
  }

  // Card operations
  async drive(player: Player, card: Unit, source: Unit | undefined = undefined) {
    return cardOperations.drive(this, player, card, source);
  }

  fieldEffectUnmount(target: Unit, stack: Stack) {
    return cardOperations.fieldEffectUnmount(this, target, stack);
  }

  // Effect handler methods
  setEffectDisplayHandler(promptId: string, handler: Function) {
    return effectHandler.setEffectDisplayHandler(this, promptId, handler);
  }

  handleEffectResponse(promptId: string, response: string[] | undefined) {
    return effectHandler.handleEffectResponse(this, promptId, response);
  }

  handleContinue(promptId: string) {
    return effectHandler.handleContinue(this, promptId);
  }

  // Stack resolver
  async resolveStack(): Promise<void> {
    return stackResolver.resolveStack(this);
  }

  // Message handler
  async handleMessage(message: Message) {
    return messageHandler.handleMessage(this, message);
  }
}
