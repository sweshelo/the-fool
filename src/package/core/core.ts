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
  EvolveDrivePayload,
  DebugMakePayload,
  DebugDrivePayload,
} from '@/submodule/suit/types';
import type { Room } from '../server/room/room';
import catalog from '@/database/catalog';
import { Stack } from './class/stack';
import { Card, Evolve, Unit } from './class/card';
import { MessageHelper } from './message';
import { Effect } from '@/database/effects';
import { EffectHelper } from '@/database/effects/classes/helper';
import { Delta } from './class/delta';
import { Parry } from './class/parry';
import { Intercept } from './class/card/Intercept';
import { Trigger } from './class/card/Trigger';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type EffectResponseCallback = Function;

interface History {
  card: Card;
  generation: number;
  action: 'drive' | 'boot';
}

export class Core {
  id: string;
  players: Player[];
  round: number = 1;
  turn: number = 1;
  room: Room;
  stack: Stack[] | undefined = undefined;
  histories: History[];

  /**
   * 効果の応答ハンドラを保存するマップ
   * promptId をキーとして、対応するコールバック関数を保持する
   */
  private effectResponses: Map<string, EffectResponseCallback> = new Map();

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
    this.room.broadcastToPlayer(player.id, MessageHelper.freeze());
    console.log('Player added:', player.id);

    // 2人が揃ったら開始
    if (this.players.length >= 2) {
      this.start();
      this.room.soundEffect('agent-interrupt');
    }
  }

  async start() {
    this.room.broadcastToPlayer(this.getTurnPlayer().id, MessageHelper.defrost());
    this.turnChange(true);
  }

  /**
   * マリガン処理の実際の動作部分（カードを引きなおす）
   * @param player マリガンを行うプレイヤー
   */
  private performMulliganAction(player: Player): void {
    // 手札をデッキに戻す
    player.deck.push(...player.hand);
    player.hand = [];

    // デッキをシャッフル
    player.deck = EffectHelper.shuffle(player.deck);

    // 規定枚数カードを引く
    [...Array(this.room.rule.system.draw.mulligan)].forEach(() => {
      player.draw();
    });

    this.room.sync();
    this.room.soundEffect('shuffle');
    this.room.soundEffect('draw');
  }

  /**
   * マリガン処理 - 手札を全てデッキに戻し、デッキをシャッフルして規定枚数カードを引く
   * プレイヤーが満足するまで繰り返すことができる
   * @param player マリガンを行うプレイヤー
   * @returns Promise<void> プレイヤーがマリガンを終了したら解決される
   */
  async mulligan(player: Player): Promise<void> {
    // 初回はカードを引く
    if (player.hand.length === 0) {
      [...Array(this.room.rule.system.draw.mulligan)].forEach(() => {
        player.draw();
      });
      this.room.sync();
    }

    // マリガンループ
    return new Promise<void>(resolve => {
      const processMulligan = () => {
        // 毎回ユニークなプロンプトIDを生成
        const promptId = `mulligan_${player.id}_${Date.now()}`;

        // マリガンの開始を通知
        this.room.broadcastToPlayer(
          player.id,
          createMessage({
            action: {
              type: 'MulliganStart',
              handler: 'client',
            },
            payload: {
              type: 'MulliganStart',
            },
          })
        );

        // プレイヤーの選択を待つ
        this.setEffectDisplayHandler(promptId, (choice: string[] | undefined) => {
          const action = choice?.[0];

          if (action === 'retry') {
            // マリガン処理を実行
            this.performMulliganAction(player);
            // 次のマリガン判断へ
            processMulligan();
          } else {
            // マリガン終了
            resolve();
          }
        });
      };

      // マリガン処理を開始
      processMulligan();
    });
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
          source: this.getTurnPlayer(),
          core: this,
        }),
      ];
      await this.resolveStack();

      // ターン終了処理
      const deathCounterCheckStack = new Stack({
        type: '_deathCounterCheckStack',
        source: this.getTurnPlayer(),
        core: this,
      });
      this.getTurnPlayer().field.forEach(unit => {
        if (unit.hasKeyword('不屈') && !unit.active) {
          unit.active = true;
          this.room.soundEffect('reboot');
        }
        if (unit.delta.some(delta => delta.effect.type === 'death' && delta.count <= 0)) {
          Effect.break(deathCounterCheckStack, unit, unit, 'death');
        }
      });
      this.stack = [deathCounterCheckStack];
      await this.resolveStack();

      // ウィルス除外
      const afterField = this.getTurnPlayer().field.filter(
        unit => !unit.delta.some(delta => delta.effect.type === 'life' && delta.count <= 0)
      );
      if (afterField.length !== this.getTurnPlayer().field.length) {
        this.getTurnPlayer().field = afterField;
        this.room.soundEffect('leave');
      }
      this.room.sync();

      // ターン開始処理
      this.turn++;
      this.round = Math.floor((this.turn + 1) / 2);
    } else {
      await Promise.all(this.players.map(player => this.mulligan(player)));
    }

    // CP初期化
    const turnPlayer = this.getTurnPlayer();
    if (turnPlayer) {
      console.log('ROUND: %s / Turn: %s', this.round, this.turn);
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
      this.room.soundEffect('cp-increase');

      // ドロー
      if (!(this.turn === 1 && this.room.rule.system.handicap.draw)) {
        [...Array(this.room.rule.system.draw.top)].forEach(() => {
          if (turnPlayer.hand.length < this.room.rule.player.max.hand) turnPlayer.draw();
        });
        this.room.soundEffect('draw');
      }

      turnPlayer.field.forEach(unit => {
        if (!unit.hasKeyword('呪縛') && !unit.active) {
          unit.active = true;
          this.room.soundEffect('reboot');
        }
      });
    }

    // 行動制限を解除する
    this.getTurnPlayer().field.forEach(
      unit =>
        (unit.delta = unit.delta.filter(
          delta => !(delta.effect.type === 'keyword' && delta.effect.name === '行動制限')
        ))
    );

    // ターン開始スタックを積み、解決する
    this.histories = [];
    this.stack = [
      new Stack({
        type: 'turnStart',
        source: this.getTurnPlayer(),
        core: this,
      }),
    ];
    await this.resolveStack();

    // 狂戦士 アタックさせる
    for (const unit of this.getTurnPlayer().field.filter(
      unit =>
        unit.hasKeyword('狂戦士') &&
        !unit.hasKeyword('攻撃禁止') &&
        !unit.hasKeyword('行動制限') &&
        unit.active
    )) {
      await this.attack(unit);
    }

    // defrost
    this.room.broadcastToPlayer(this.getTurnPlayer().id, MessageHelper.defrost());
  }

  // アタック
  async attack(attacker: Unit) {
    if (!attacker.owner.field.find(unit => unit.id === attacker.id)) return;

    this.room.broadcastToAll(
      createMessage({
        action: {
          type: 'effect',
          handler: 'client',
        },
        payload: {
          type: 'VisualEffect',
          body: {
            effect: 'attack',
            attackerId: attacker.id,
          },
        },
      })
    );
    this.room.soundEffect('decide');

    this.stack = [
      new Stack({
        type: 'attack',
        source: attacker.owner,
        target: attacker,
        core: this,
      }),
    ];
    await this.resolveStack();

    // アタッカー生存チェック
    if (!attacker.owner.field.find(unit => unit.id === attacker.id)) return;

    let blocker: Unit | undefined = undefined;

    try {
      blocker = await this.block(attacker);

      // アタッカー/ブロッカー生存チェック
      if (
        !attacker.owner.field.find(unit => unit.id === attacker.id) ||
        (blocker && !blocker.owner.field.find(unit => unit.id === blocker?.id))
      ) {
        attacker.active = false;
        this.room.broadcastToAll(
          createMessage({
            action: {
              type: 'effect',
              handler: 'client',
            },
            payload: {
              type: 'VisualEffect',
              body: {
                effect: 'launch-cancel',
                attackerId: attacker.id,
              },
            },
          })
        );
        return;
      }

      if (blocker) {
        await this.preBattle(attacker, blocker);
        // アタッカー/ブロッカー生存チェック
        if (
          !attacker.owner.field.find(unit => unit.id === attacker.id) ||
          !blocker.owner.field.find(unit => unit.id === blocker?.id)
        ) {
          attacker.active = false;
          this.room.broadcastToAll(
            createMessage({
              action: {
                type: 'effect',
                handler: 'client',
              },
              payload: {
                type: 'VisualEffect',
                body: {
                  effect: 'launch-cancel',
                  attackerId: attacker.id,
                },
              },
            })
          );
          return;
        }
      }
    } catch (e) {
      if (e instanceof Parry) {
        console.log(`${e.card.catalog.name} によるパリィが行われました`);
      }
    }

    // NOTE: 生存確認処理を行い、attacker/blocker(非undefinedの場合)の両者が生存していれば以下が実行される
    this.room.broadcastToAll(
      createMessage({
        action: {
          type: 'effect',
          handler: 'client',
        },
        payload: {
          type: 'VisualEffect',
          body: {
            effect: 'launch',
            attackerId: attacker.id,
            blockerId: blocker?.id,
          },
        },
      })
    );

    attacker.active = false;
    this.room.sync();

    if (blocker) {
      await this.postBattle(attacker, blocker);
    } else {
      attacker.owner.opponent.damage();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // プレイヤーアタックに成功
      this.stack = [
        new Stack({
          type: 'playerAttack',
          target: attacker.owner.opponent,
          source: attacker,
          core: this,
        }),
      ];
      await this.resolveStack();
    }
  }

  /**
   * アタック後、ブロックして効果を解決する
   * @param attacker 攻撃するユニット
   */
  async block(attacker: Unit): Promise<Unit | undefined> {
    // プレイヤーを特定
    const attackerOwner = attacker.owner;
    const blockerOwner = this.players.find(player => player.id !== attackerOwner.id);

    if (!blockerOwner || !attackerOwner)
      throw new Error('存在しないプレイヤーまたはユニットが指定されました');

    // ブロック側ユニットのブロック可能ユニットを列挙
    const blockable = blockerOwner.field.filter((unit: Unit) => {
      // 次元干渉を発動している場合、指定コスト以上のユニットはブロックできない
      const blockableCost = attacker.hasKeyword('次元干渉')
        ? Math.min(
            ...attacker.delta
              .map(delta =>
                delta.effect.type === 'keyword' && delta.effect.name === '次元干渉'
                  ? delta.effect.cost
                  : undefined
              )
              .filter(v => v !== undefined)
          )
        : undefined;
      const isNumber = blockableCost !== undefined && Number.isInteger(blockableCost);

      return (
        unit.active &&
        !unit.hasKeyword('防御禁止') &&
        (isNumber ? unit.catalog.cost < blockableCost : true)
      );
    });

    const forceBlock = blockable.filter((unit: Unit) => {
      return unit.hasKeyword('強制防御');
    });

    // 強制防御を持つユニットがいない場合はそのまま素のcandidateを返却する
    const candidate = forceBlock.length > 0 ? forceBlock : blockable;

    // ブロックさせる
    const promptId = `${attacker.id}_attack_${Date.now()}`;
    if (candidate.length > 0) {
      this.room.broadcastToPlayer(
        blockerOwner.id,
        createMessage({
          action: {
            type: 'pause',
            handler: 'client',
          },
          payload: {
            type: 'Choices',
            promptId,
            player: blockerOwner.id,
            choices: {
              title: 'ブロックするユニットを選択してください',
              type: 'block',
              items: candidate,
              isCancelable: forceBlock.length === 0,
            },
          },
        })
      );
    }

    // クライアントからの応答を待つ
    const [blockerId] =
      candidate.length > 0
        ? await new Promise<string[]>(resolve => {
            this.setEffectDisplayHandler(promptId, (choice: string[] | undefined) => {
              resolve(choice ?? []);
            });
          })
        : [];

    // IDから対象を割り出し
    const blocker = blockerOwner.field.find(unit => unit.id === blockerId);

    this.room.soundEffect('decide');
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (blocker) {
      this.stack = [
        new Stack({
          type: 'block',
          source: attacker,
          target: blocker,
          core: this,
        }),
      ];
      await this.resolveStack();
    }

    return blocker;
  }

  /**
   * 戦闘 前処理 - Stack解決
   * @param attacker 攻撃するユニット
   * @param blocker ブロックするユニット
   */
  async preBattle(attacker: Unit, blocker: Unit) {
    this.stack = [
      new Stack({
        type: 'battle',
        source: attacker,
        target: blocker,
        core: this,
      }),
    ];
    console.log('戦闘Stack: %s vs %s', attacker.catalog.name, blocker.catalog.name);
    await this.resolveStack();
  }

  /**
   * 戦闘 後処理 - BP比較演算
   * @param attacker 攻撃するユニット
   * @param blocker ブロックするユニット
   */
  async postBattle(attacker: Unit, blocker: Unit) {
    // BP順にソートして暫定的に勝敗を決める
    // 実際の戦闘処理はこのあとのダメージを与え合う過程で行われ、
    // ダメージを与えあったあとの生存状況に応じて勝敗が確定する
    const [winner, loser] = [attacker, blocker].sort((a, b) => {
      // BPが異なる場合は大きい方を優先
      if (b.currentBP !== a.currentBP) {
        return b.currentBP - a.currentBP;
      }
      // BPが等しい場合、不滅キーワードを持っている方を優先
      if (a.hasKeyword('不滅') && !b.hasKeyword('不滅')) {
        return -1; // aを優先
      } else if (!a.hasKeyword('不滅') && b.hasKeyword('不滅')) {
        return 1; // bを優先
      }
      return 0; // どちらも不滅を持っているか、どちらも持っていない場合は等価
    });

    if (!winner || !loser) {
      throw new Error('ユニットの勝敗判定に失敗しました');
    }

    // システムスタック: Effect.damage() を呼ぶために生成している
    const stack = new Stack({
      type: '_postBattle',
      source: attacker,
      target: blocker,
      core: this,
    });

    // ダメージ量を確定する
    const [loserDamage, winnerDamage] = [winner.currentBP, loser.currentBP];

    // ダメージを与えるのは次の場合:
    // - 敗者が破壊されることが確定している: 敗者に【不滅】がない (-> 直接破壊する)
    // - 勝者が破壊されることが確定している: 勝者と敗者のBPが等しく、勝者に【不滅】がない (-> 直接破壊する)
    // - 勝者のレベルが 3 以上で、【不滅】または【王の治癒力】がない
    const isLoserBreaked = loser.hasKeyword('不滅') ? false : true;
    const isWinnerBreaked = winner.hasKeyword('不滅')
      ? false
      : winner.hasKeyword('王の治癒力') && winner.currentBP > winnerDamage
        ? false
        : winner.lv >= 3 || loser.hasKeyword('不滅')
          ? Effect.damage(stack, loser, winner, winnerDamage, 'battle') // Lv3の場合、キーワード効果を持たない限り勝っても負けてもダメージを負う
          : winnerDamage === loserDamage
            ? true
            : false;

    // 破壊が決定したら破壊する
    if (isLoserBreaked && !loser.destination) Effect.break(stack, winner, loser, 'battle');
    if (isWinnerBreaked && !winner.destination) Effect.break(stack, loser, winner, 'battle');

    await new Promise(resolve => setTimeout(resolve, 1000));

    this.stack = [stack];
    await this.resolveStack();

    // winnerが生存しており、Lvが3未満の場合はクロックアップさせる
    // NOTE: 戦闘による破壊スタックによってフィールドを離れる可能性があるので生存チェックをする
    if (
      !isWinnerBreaked &&
      isLoserBreaked &&
      winner.owner.field.find(unit => unit.id === winner.id)
    ) {
      // 戦闘勝利後のクロックアップ処理
      const systemStack =
        winner.lv < 3
          ? new Stack({
              type: '_postBattleClockUp',
              source: loser,
              target: winner,
              core: this,
            })
          : undefined;
      if (systemStack) Effect.clock(systemStack, loser, winner, 1);

      // 戦闘勝利スタック
      const winnerStack = new Stack({
        type: 'win',
        source: loser,
        target: winner,
        core: this,
      });

      this.stack = [systemStack, winnerStack].filter(
        (stack): stack is Stack => stack !== undefined
      );
      await this.resolveStack();
    }

    this.room.sync();
    return;
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
          if (this.stack.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 750));
          }
        }

        // 処理完了後、スタックをクリア
        this.stack = [];
      } catch (error) {
        if (error instanceof Parry) throw error;
        console.error('Error resolving stack:', error);
        this.stack = [];
      }
    }
  }

  /**
   * クライアントからの効果応答を処理する
   * @param promptId プロンプトID
   * @param response ユーザーの選択内容
   */
  handleEffectResponse(promptId: string, response: string[] | undefined): void {
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

  /**
   * ユニットを召喚する
   * @param player 召喚するフィールドを持つプレイヤー
   * @param card 対象のカード
   * @param source (進化の場合)進化元
   */
  async drive(player: Player, card: Unit, source: Unit | undefined = undefined) {
    if (source !== undefined) {
      // 進化元が存在していたindexに進化先を配置する
      const index = player.field.findIndex(unit => unit.id === source?.id);
      if (index === -1) throw new Error('進化元が見つかりませんでした');

      // 進化元の行動権を継承
      card.active = source.active;
      player.field[index] = card;
      this.fieldEffectUnmount(source);
      card.delta = [];

      if (!source.isCopy) {
        player.trash.push(source);
        source.reset();
      }
    } else {
      card.active = true;
      player.field.push(card);
      card.delta = [new Delta({ type: 'keyword', name: '行動制限' })];
    }

    card.initBP();
    this.room.soundEffect(source !== undefined ? 'evolve' : 'drive');
    this.room.sync();

    // 召喚時点でのLv
    const lv = card.lv;

    // 起動アイコン
    if (typeof card.catalog.onBootSelf === 'function')
      card.delta.unshift(new Delta({ type: 'keyword', name: '起動' }));

    // Stack追加
    this.histories.push({
      card: card,
      action: 'drive',
      generation: card.generation,
    });

    this.stack = [
      new Stack({
        type: 'drive',
        source: player,
        target: card,
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
            image: `https://coj.sega.jp/player/img/${card.catalog.img}`,
            player: player.id,
            type: card.catalog.type === 'unit' ? 'UNIT' : 'EVOLVE',
          },
        },
      })
    );

    // wait
    await new Promise(resolve => setTimeout(resolve, 1500));

    // スタックの解決処理を開始
    await this.resolveStack();

    // Lv3起動 - Lv3を維持&未OC&フィールドに残留している
    if (
      lv === 3 &&
      card.lv === 3 &&
      !card.overclocked &&
      player.field.find(unit => unit.id === card.id)
    ) {
      this.stack = [
        new Stack({
          type: 'overclock',
          source: card,
          target: card,
          core: this,
        }),
      ];
      await this.resolveStack();
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

          target.card.reset();
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
      case 'EvolveDrive':
      case 'UnitDrive': {
        this.room.broadcastToAll(MessageHelper.freeze());
        const payload: UnitDrivePayload | EvolveDrivePayload = message.payload;
        const player = this.players.find(p => p.id === payload.player);
        const { card } = player?.find({ ...payload.target } satisfies IAtom) ?? {};
        if (!card || !player) return;

        const cardCatalog = catalog.get(card.catalogId);
        if (!cardCatalog) throw new Error('カタログに存在しないカードが指定されました');

        // Bannedチェック
        if (card.delta.some(delta => delta.effect.type === 'banned')) return;

        // CPが足りている
        // 軽減チェック
        const mitigate = player.trigger.find(
          c =>
            c.catalog.color === card.catalog.color &&
            (c.catalog.type === 'advanced_unit' || c.catalog.type === 'unit')
        );
        const isEnoughCP =
          cardCatalog.cost -
            (mitigate ? 1 : 0) +
            card.delta
              .map(delta => (delta.effect.type === 'cost' ? delta.effect.value : 0))
              .reduce((acc, cur) => acc + cur, 0) <=
          player.cp.current;

        // ユニットである
        const isUnit = card instanceof Unit;

        // 進化?
        const isEvolve = message.payload.type === 'EvolveDrive' && 'source' in payload;

        // フィールドのユニット数が規定未満
        const hasFieldSpace = isEvolve
          ? true
          : player.field.length < this.room.rule.player.max.field;

        const source = isEvolve
          ? player.field.find(unit => unit.id === payload.source.id)
          : undefined;
        if (isEvolve) {
          const notEvolvable =
            source?.catalog.species?.includes('ウィルス') || source?.hasKeyword('進化禁止');

          if (notEvolvable) {
            console.error('進化できないユニットが進化元に指定されました');
            return;
          }

          if (!source) {
            console.error('進化ユニットが召喚されようとしましたが source が不正でした');
          }
        }

        if (isEnoughCP && hasFieldSpace && isUnit) {
          const cost =
            card.catalog.cost +
            card.delta
              .map(delta => (delta.effect.type === 'cost' ? delta.effect.value : 0))
              .reduce((acc, cur) => acc + cur, 0);

          // オリジナルのcostが0でない場合はmitigateをtriggerからtrashに移動させる
          if (cost > 0 && mitigate) {
            player.trigger = player.trigger.filter(c => c.id !== mitigate.id);
            mitigate.lv = 1;
            player.trash.push(mitigate);
          }

          const actualCost = cost - (mitigate ? 1 : 0);
          player.cp.current -= Math.min(Math.max(actualCost, 0), player.cp.current);
          if (actualCost > 0) this.room.soundEffect('cp-consume');
          player.hand = player?.hand.filter(c => c.id !== card?.id);

          await this.drive(player, card, source);
        }

        this.room.broadcastToPlayer(this.getTurnPlayer().id, MessageHelper.defrost());
        break;
      }

      case 'Withdrawal': {
        const payload: WithdrawalPayload = message.payload;
        const player = this.players.find(p => p.id === payload.player);
        const target = player?.field.find(unit => unit.id === payload.target.id);

        if (target?.hasKeyword('撤退禁止') || target?.catalog.species?.includes('ウィルス'))
          throw new Error('撤退できないユニットが指定されました');

        if (target && player) {
          player.field = player.field.filter(u => u.id !== target.id);
          player.trash.push(target);
          target.reset();
          this.fieldEffectUnmount(target);
          this.room.soundEffect('withdrawal');
          this.room.sync();

          // フィールド効果呼び出し
          const stack = new Stack({
            type: '_withdraw',
            core: this,
            source: target,
          });
          this.stack = [stack];
          await this.resolveStack();
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
        const { payload } = message;

        // IUnit -> Unitに変換
        const attacker = this.players
          .find(player => player.id === payload.player)
          ?.field.find(unit => unit.id === payload.target.id);
        if (!attacker) throw new Error('存在しないユニットがアタッカーとして指定されました');
        if (attacker.hasKeyword('行動制限') || attacker.hasKeyword('攻撃禁止'))
          throw new Error('攻撃できないユニットがアタッカーとして指定されました');

        this.attack(attacker);
        break;
      }

      case 'Boot': {
        const payload = message.payload;
        const player = this.players.find(p => p.id === payload.player);
        const target = player?.field.find(unit => unit.id === payload.target.id);

        if (
          !player ||
          !target ||
          !target.catalog.isBootable ||
          typeof target.catalog.isBootable !== 'function'
        )
          return;
        if (
          target.catalog.isBootable(this, target) &&
          !this.histories.some(
            history =>
              history.action === 'boot' &&
              history.card.id === target.id &&
              history.generation === target.generation
          )
        ) {
          this.histories.push({
            card: target,
            action: 'boot',
            generation: target.generation,
          });
          this.room.soundEffect('recover');
          await new Promise(resolve => setTimeout(resolve, 900));
          this.stack = [new Stack({ type: 'boot', target, core: this, source: player })];
          await this.resolveStack();
        }
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
          target.card.reset();
          this.room.sync();
          this.room.soundEffect('trash');
        }
        break;
      }

      case 'Mulligan': {
        const payload = message.payload;
        // Find the correct mulligan promptId from our map
        // The promptId now contains a timestamp, so we need to find the one that starts with mulligan_${player.id}_
        const mulliganPromptId = Array.from(this.effectResponses.keys()).find(id =>
          id.startsWith(`mulligan_${payload.player}_`)
        );

        if (mulliganPromptId) {
          this.handleEffectResponse(mulliganPromptId, [payload.action]);
        } else {
          console.warn(`No mulligan handler found for player ${payload.player}`);
        }
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
      case 'DebugMake': {
        const payload: DebugMakePayload = message.payload;
        const target = this.players.find(player => player.id === payload.player);
        const master = catalog.get(payload.catalogId);
        if (target && master) {
          switch (master.type) {
            case 'unit':
              target.hand.push(new Unit(target, master.id));
              break;
            case 'advanced_unit':
              target.hand.push(new Evolve(target, master.id));
              break;
            case 'intercept':
              target.hand.push(new Intercept(target, master.id));
              break;
            case 'trigger':
              target.hand.push(new Trigger(target, master.id));
              break;
          }
          break;
        }
        break;
      }
      case 'DebugDrive': {
        const payload: DebugDrivePayload = message.payload;
        const target = this.players.find(player => player.id === payload.player);
        const master = catalog.get(payload.catalogId);
        if (target && master) {
          switch (master.type) {
            case 'unit':
              await this.drive(target, new Unit(target, master.id));
              break;
            default:
              throw new Error('召喚できないカードが指定されました');
          }
        }
      }
    }

    this.stack = [
      new Stack({ type: '_messageRecieved', source: this.getTurnPlayer(), core: this }),
    ];
    await this.resolveStack();
  }

  // フィールド効果を掃除する
  // フィールドを離れるカードに起因する効果を取り除く
  fieldEffectUnmount(target: Unit) {
    [
      ...this.players.flatMap(player => player.field),
      ...this.players.flatMap(player => player.hand),
      ...this.players.flatMap(player => player.trigger),
    ].forEach(card => {
      card.delta = card.delta.filter(delta => delta.source?.unit !== target.id);
    });
  }
}
