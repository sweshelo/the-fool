import type { Message } from '@/submodule/suit/types/message/message';
import type { Player } from './class/Player';
import { config } from '../../config';
import type {
  DebugDrawPayload,
  IAtom,
  OverridePayload,
  UnitDrivePayload,
  ChoosePayload,
} from '@/submodule/suit/types';
import type { ContinuePayload } from '@/submodule/suit/types/message/payload/client';
import type { Room } from '../server/room/room';
import catalog from '@/database/catalog';
import { isUnit as checkIsUnit } from '@/helper';
import { Stack } from './class/stack';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type EffectResponseCallback = Function;

export class Core {
  id: string;
  players: Player[];
  round: number = 1;
  turn: number = 1;
  room: Room;
  stack: Stack[] | undefined = undefined;

  /**
   * 効果の応答ハンドラを保存するマップ
   * promptId をキーとして、対応するコールバック関数を保持する
   */
  private effectResponses: Map<string, EffectResponseCallback> = new Map();

  constructor(room: Room) {
    this.id = crypto.randomUUID();
    this.players = [];
    this.room = room;
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
        this.players.map(p => p.id)
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

  /**
   * 現在のターンプレイヤーのIDを取得する
   * @returns ターンプレイヤーのID
   */
  getTurnPlayerId(): string | undefined {
    // 現在のターン数から、対応するプレイヤーのインデックスを計算
    const playerIndex = (this.turn - 1) % this.players.length;
    return this.players[playerIndex]?.id;
  }

  /**
   * 効果応答のハンドラを設定する
   * @param promptId プロンプトID
   * @param handler 応答を処理するコールバック関数
   */
  setEffectDisplayHandler(promptId: string, handler: EffectResponseCallback): void {
    this.effectResponses.set(promptId, handler);
  }

  /**
   * 現在のスタックを解決する
   * UnitDrive操作などでスタックが作成された後に呼び出される
   */
  async resolveStack(): Promise<void> {
    if (this.stack !== undefined) {
      try {
        while (this.stack.length > 0) {
          const stackItem = this.stack.shift();
          await stackItem?.resolve(this);
          this.room.sync();
        }

        // 処理完了後、スタックをクリア
        this.stack = undefined;
      } catch (error) {
        console.error('Error resolving stack:', error);
        this.stack = undefined;
      }
    }
  }

  /**
   * クライアントからの効果応答を処理する
   * @param promptId プロンプトID
   * @param response ユーザーの選択内容
   */
  handleEffectResponse(promptId: string, response: string[]): void {
    const handler = this.effectResponses.get(promptId);
    if (handler) {
      handler(response);
      this.effectResponses.delete(promptId);
    } else {
      console.warn(`No handler found for prompt ${promptId}`);
    }
  }

  /**
   * クライアントからの再開処理を受け取る
   * @param promptId プロンプトID
   */
  handleContinue(promptId: string): void {
    const handler = this.effectResponses.get(promptId);
    if (handler) {
      handler();
      this.effectResponses.delete(promptId);
    } else {
      console.warn(`No handler found for prompt ${promptId}`);
    }
  }

  handleMessage(message: Message) {
    console.log('passed message to Core : type<%s>', message.action.type);
    switch (message.payload.type) {
      case 'Choose': {
        const payload: ChoosePayload = message.payload;
        this.handleEffectResponse(payload.promptId, payload.choice);
        break;
      }
      case 'Continue': {
        const payload: ContinuePayload = message.payload;
        this.handleContinue(payload.promptId);
        break;
      }
      case 'DebugDraw': {
        const payload: DebugDrawPayload = message.payload;
        const target = this.players.find(player => player.id === payload.player);
        if (target) {
          target.draw();
          this.room.sync();
        }
        break;
      }
      case 'Override': {
        const payload: OverridePayload = message.payload;
        // オーバーライド要件を満たしているかチェックする
        const player = this.players.find(p => p.id === payload.player);
        const parent = player?.find({ ...payload.parent } satisfies IAtom);
        const target = player?.find({ ...payload.target } satisfies IAtom);

        if (!parent?.card || !target?.card || !player) return;

        // 2つのカードがどちらも手札の中にある
        const isOnHand = parent.place?.name === 'hand' && target?.place?.name === 'hand';

        // 2つのカードが同じである
        // TODO: strictModeな設定を作り、同名判定を厳密にするモードを用意する
        const isSameCard =
          catalog.get(parent.card.catalogId)?.name === catalog.get(target.card.catalogId)?.name;

        // 受け皿がLv3未満
        const isUnderLv3 = parent?.card?.lv < 3;

        if (isOnHand && isSameCard && isUnderLv3) {
          player.hand = player?.hand.filter(card => card.id !== target.card?.id);
          parent.card.lv++;
          player.trash.unshift(target.card);
          player.draw();
          this.room.sync();
        }
        break;
      }
      case 'UnitDrive': {
        const payload: UnitDrivePayload = message.payload;
        const player = this.players.find(p => p.id === payload.player);
        const { card } = player?.find({ ...payload.target } satisfies IAtom) ?? {};
        if (!card || !player) return;

        const cardCatalog = catalog.get(card.catalogId);
        if (!cardCatalog) throw new Error('カタログに存在しないカードが指定されました');

        // CPが足りている
        const isEnoughCP = cardCatalog.cost <= player.cp.current || true; // debug用

        // フィールドのユニット数が規定未満
        const isEnoughField = player.field.length < this.room.rule.player.max.field;

        // ユニットである
        const isUnit = checkIsUnit(card);

        if (isEnoughCP && isEnoughField && isUnit) {
          player.hand = player?.hand.filter(c => c.id !== card?.id);
          player.field.unshift(card);
          this.room.sync();

          // Stack追加
          this.stack = [
            new Stack({
              type: 'drive',
              source: card,
            }),
            card.lv === 3 &&
              new Stack({
                type: 'overclock',
                source: card,
              }),
          ].filter(_ => !!_);

          // スタックの解決処理を開始
          this.resolveStack();
        }
        break;
      }
    }
  }
}
