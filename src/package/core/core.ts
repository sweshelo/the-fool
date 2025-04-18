import { createMessage, type Message } from '@/submodule/suit/types/message/message';
import type { Player } from './class/Player';
import type {
  DebugDrawPayload,
  IAtom,
  OverridePayload,
  UnitDrivePayload,
  ChoosePayload,
  WithdrawalPayload,
  ContinuePayload,
  TriggerSetPayload,
} from '@/submodule/suit/types';
import type { Room } from '../server/room/room';
import catalog from '@/database/catalog';
import { Stack } from './class/stack';
import { Unit } from './class/card';
import { MessageHelper } from './message';

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
    this.room.broadcastToPlayer(player.id, MessageHelper.freeze());
    console.log('Player added:', player.id);

    // 2人が揃ったら開始
    if (this.players.length >= 2) {
      this.start();
      this.room.soundEffect('agent-interrupt');
    }
  }

  async start() {
    this.room.broadcastToPlayer(this.getTurnPlayerId()!, MessageHelper.defrost());
    this.turnChange(true);
  }

  // ターンチェンジ
  async turnChange(isFirstTurn: boolean = false) {
    // freeze
    this.room.broadcastToAll(MessageHelper.freeze());

    if (!isFirstTurn) {
      // ターン終了スタックを積み、解決する
      this.stack = [
        new Stack({
          type: 'turnEnd',
          source: this.players.find(player => player.id === this.getTurnPlayerId())!,
          core: this,
        }),
      ];
      await this.resolveStack();

      // ターン終了処理
      // TODO: 不屈 ダメージリセット

      // ターン開始処理
      this.turn++;
      this.round = Math.floor(this.turn / 2);
    }

    // CP初期化
    const turnPlayer = this.players.find(player => player.id === this.getTurnPlayerId());
    if (turnPlayer) {
      const max =
        this.room.rule.system.cp.init +
        this.room.rule.system.cp.increase * (this.round - 1) +
        (this.room.rule.system.handicap.cp && this.round === 1 && this.turn === 2 ? 1 : 0);
      turnPlayer.cp = {
        current: Math.min(
          max + (this.room.rule.system.cp.carryover ? turnPlayer.cp.current : 0),
          this.room.rule.system.cp.ceil,
          this.room.rule.system.cp.max
        ),
        max: Math.min(max, this.room.rule.system.cp.ceil, this.room.rule.system.cp.max),
      };
    }
    this.room.soundEffect('cp-increase');

    // ドロー
    [...Array(this.room.rule.system.draw.top)].forEach(() => {
      if (turnPlayer?.hand.length && turnPlayer?.hand.length < this.room.rule.player.max.hand)
        turnPlayer?.draw();
    });
    this.room.soundEffect('draw');

    // TODO: 行動権復活
    // this.room.soundEffect('reboot')

    // ターン開始スタックを積み、解決する
    this.stack = [
      new Stack({
        type: 'turnStart',
        source: this.players.find(player => player.id === this.getTurnPlayerId())!,
        core: this,
      }),
    ];
    await this.resolveStack();

    // defrost
    this.room.broadcastToPlayer(this.getTurnPlayerId()!, MessageHelper.defrost());
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

          // 後続のStackがある場合は待たせる
          if (this.stack.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 750));
          }
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

  async handleMessage(message: Message) {
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
        const isSameCard = this.room.rule.misc.strictOverride
          ? catalog.get(parent.card.catalogId)?.id === catalog.get(target.card.catalogId)?.id
          : catalog.get(parent.card.catalogId)?.name === catalog.get(target.card.catalogId)?.name;

        // 受け皿がLv3未満
        const isUnderLv3 = parent?.card?.lv < 3;

        if (isOnHand && isSameCard && isUnderLv3) {
          player.hand = player?.hand.filter(card => card.id !== target.card?.id);
          parent.card.lv++;
          player.trash.push(target.card);
          [...Array(this.room.rule.system.draw.override)].forEach(() => {
            if (player.hand.length < this.room.rule.player.max.hand) {
              player.draw();
            }
          });
          this.room.sync();
          this.room.soundEffect('draw');
          this.room.soundEffect('clock-up');
          this.room.soundEffect('trash');
        }
        break;
      }
      case 'UnitDrive': {
        this.room.broadcastToAll(MessageHelper.freeze());
        const payload: UnitDrivePayload = message.payload;
        const player = this.players.find(p => p.id === payload.player);
        const { card } = player?.find({ ...payload.target } satisfies IAtom) ?? {};
        if (!card || !player) return;

        const cardCatalog = catalog.get(card.catalogId);
        if (!cardCatalog) throw new Error('カタログに存在しないカードが指定されました');

        // CPが足りている
        // 軽減チェック
        const mitigate = player.trigger.find(
          c =>
            c.catalog().color === card.catalog().color &&
            (c.catalog().type === 'advanced_unit' || c.catalog().type === 'unit')
        );
        const isEnoughCP = cardCatalog.cost - (mitigate ? 1 : 0) <= player.cp.current; // debug用

        // フィールドのユニット数が規定未満
        const isEnoughField = player.field.length < this.room.rule.player.max.field;

        // ユニットである
        const isUnit = card instanceof Unit;

        if (isEnoughCP && isEnoughField && isUnit) {
          const cost = card.catalog().cost;

          // オリジナルのcostが0でない場合はmitigateをtriggerからtrashに移動させる
          if (cost > 0 && mitigate) {
            player.trigger = player.trigger.filter(c => c.id !== mitigate.id);
            player.trash.push(mitigate);
          }

          player.cp.current -= cost - (mitigate ? 1 : 0);
          if (cost > 0) this.room.soundEffect('cp-consume');

          player.hand = player?.hand.filter(c => c.id !== card?.id);
          player.field.push(card);
          card.initBP();
          this.room.sync();
          this.room.soundEffect('drive');

          // 召喚時点でのLv
          const lv = card.lv;

          // Stack追加
          this.stack = [
            new Stack({
              type: 'drive',
              source: card,
              core: this,
            }),
          ];

          this.room.broadcastToAll(
            createMessage({
              action: {
                type: 'effect',
                handler: 'client',
              },
              payload: {
                type: 'VisualEffect',
                body: {
                  effect: 'drive',
                  image: `https://coj.sega.jp/player/img/${card.catalog().img}`,
                  player: player.id,
                  type: card.catalog().type === 'unit' ? 'UNIT' : 'EVOLVE',
                },
              },
            })
          );

          // wait
          await new Promise(resolve => setTimeout(resolve, 1000));

          // スタックの解決処理を開始
          await this.resolveStack();

          // Lv3起動 - Lv3を維持&未OC&フィールドに残留している
          if (lv === 3 && card.lv === 3 && !card.overclocked) {
            // && player.field.find(unit => unit.id === card.id)) {
            this.stack = [
              new Stack({
                type: 'overclock',
                source: card,
                core: this,
              }),
            ];
            await this.resolveStack();
          }
        }

        this.room.broadcastToPlayer(this.getTurnPlayerId()!, MessageHelper.defrost());
        break;
      }

      case 'Withdrawal': {
        const payload: WithdrawalPayload = message.payload;
        const player = this.players.find(p => p.id === payload.player);
        const target = player?.find(payload.target);
        const isOnField = target?.place?.name === 'field';

        if (target && target.card && player && isOnField) {
          player.field = player.field.filter(u => u.id !== target.card?.id);
          player.trash.push(target.card);
          target.card.lv = 1;
          this.room.sync();
          this.room.soundEffect('withdrawal');
        }
        break;
      }

      case 'TriggerSet': {
        const payload: TriggerSetPayload = message.payload;
        const player = this.players.find(p => p.id === payload.player);
        const target = player?.find(payload.target);
        const isOnHand = target?.place?.name === 'hand';
        const isEnoughTriggerZone = player!.trigger.length < this.room.rule.player.max.trigger;

        if (target && target.card && player && isEnoughTriggerZone && isOnHand) {
          player.hand = player.hand.filter(c => c.id !== target.card?.id);
          player.trigger.push(target.card);
          this.room.sync();
          this.room.soundEffect('trigger');
        }
        break;
      }

      case 'TurnEnd': {
        this.turnChange();
        break;
      }

      case 'Attack': {
        break;
      }

      case 'Boot': {
        break;
      }

      case 'Discard': {
        const payload = message.payload;
        const player = this.players.find(p => p.id === payload.player);
        const target = player?.find(payload.target);
        const isOnHand = target?.place?.name === 'hand';

        if (target && target.card && player && isOnHand) {
          player.hand = player.hand.filter(c => c.id !== target.card?.id);
          player.trash.push(target.card);
          this.room.sync();
          this.room.soundEffect('trash');
        }
        break;
      }
    }
  }
}
