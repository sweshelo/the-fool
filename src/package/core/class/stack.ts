import { createMessage } from '@/submodule/suit/types';
import { Player, type CardArrayKeys } from './Player';
import type { Core } from '../core';
import type { CatalogWithHandler } from '@/database/factory';
import master from '@/database/catalog';
import { Card, Unit } from './card';
import { Effect, System } from '@/database/effects';
import { Color } from '@/submodule/suit/constant/color';
import type { StackWithCard } from '@/database/effects/classes/types';
import { Parry } from './parry';

interface IStack {
  /**
   * @param type そのStackのタイプを示す
   */
  type: string;
  /**
   * @param source そのStackを発生させたカードを示す。例えば召喚操作の場合、召喚したPlayerが指定される。破壊効果の場合は、その効果を発動したUnitが指定される。
   */
  source: Card | Player;
  /**
   * @param target そのStackによって影響を受ける対象を示す。例えば召喚操作の場合、召喚されたUnitが指定される。破壊効果の場合は、破壊されたUnitが指定される。
   */
  target?: Card | Player;
  /**
   * @param parent そのStackが発生した契機の親にあたる。例えば召喚効果によって相手を破壊するStackが発生した場合、親が召喚スタック、子が破壊スタックとなる。
   */
  parent?: Stack;
  /**
   * @param parent あるStackが発生した際、その解決途中に新規で発生したスタックに当たる。例えば召喚効果によって相手を破壊するStackが発生した場合、親が召喚スタック、子が破壊スタックとなる。
   * 子はいくつでも持つことが出来るが、同時に発生しない限り兄弟は持たない。
   * つまり「全体を破壊する」効果であれば、破壊スタックは兄弟になりえるが、破壊によって発生した新スタック(例: 《ミイラくん》によるハンデス)は兄弟ではなく子になる。
   */
  children: Stack[];
  core: Core;
  option?: StackOption;
}

type StackOption =
  | {
      // 破壊
      type: 'break';
      cause: 'effect' | 'battle' | 'damage' | 'death' | 'system';
    }
  | {
      type: 'bounce';
      location: 'hand' | 'deck' | 'trigger';
    }
  | {
      // ダメージ
      type: 'damage';
      cause: 'effect' | 'battle';
      value: number;
    }
  | {
      // CP増減
      type: 'cp';
      value: number;
    }
  | {
      type: 'lv';
      value: number;
    }
  | {
      type: 'purple';
      value: number;
    };

export class Stack implements IStack {
  type: string;
  source: Card | Player;
  target?: Card | Player;
  parent: undefined | Stack;
  children: Stack[];
  core: Core;
  processing: Card | undefined;
  option?: StackOption;

  constructor({ type, source, target, parent, core, option }: Omit<IStack, 'children'>) {
    this.type = type;
    this.source = source;
    this.target = target;
    this.parent = parent;
    this.children = [];
    this.core = core;
    this.option = option;
  }

  /**
   * スタックの効果を処理する
   * ターンプレイヤーのカード、非ターンプレイヤーのカードの順に処理する
   * @param core ゲームのコアインスタンス
   */
  async resolve(core: Core): Promise<void> {
    // ターンプレイヤーを取得
    const turnPlayer = core.getTurnPlayer();
    const nonTurnPlayer = core.players.find(p => p.id !== turnPlayer.id);

    // 対象のイベントが発生した時点でフィールドに存在していなかったユニットは除外する
    const field = {
      turnPlayer: [...turnPlayer.field],
      nonTurnPlayer: [...(nonTurnPlayer?.field ?? [])],
    };

    if (this.type === 'overclock') {
      if (this.target instanceof Unit && this.target.lv === 3) {
        this.target.overclocked = true;
        this.target.active = true;
        this.target.delta = this.target.delta.filter(
          delta => !(delta.effect.type === 'keyword' && delta.effect.name === '行動制限')
        );
        core.room.soundEffect('clock-up-field');
        core.room.soundEffect('reboot');
        core.room.sync();
      } else {
        // NOTE: Effect.clock()で onClockup効果解決後に対象のユニットがフィールドを去った or レベルが下がる場合がある
        return;
      }
    }

    // まず イベントに起因するカードの効果を処理
    switch (this.type) {
      // 効果を発生させた側のチェックをする場合
      case 'playerAttack': {
        if (this.source instanceof Unit && !this.source.hasKeyword('沈黙')) {
          await this.processCardEffect(this.source, core, 'Self');
          await this.resolveChild(core);
        }
        break;
      }

      // 両方のチェックをする場合
      case 'battle': {
        if (this.source instanceof Unit && this.target instanceof Unit) {
          const targets = [this.source, this.target];
          for (const target of targets) {
            if (target instanceof Unit && !target.hasKeyword('沈黙')) {
              await this.processCardEffect(target, core, 'Self');
              await this.resolveChild(core);
            }
          }
        } else {
          throw new Error('ユニット同士でないものが戦闘しています');
        }
        break;
      }

      // 効果の影響を受けた側のチェックをする場合
      default: {
        if (this.target instanceof Unit && !this.target.hasKeyword('沈黙')) {
          await this.processCardEffect(this.target, core, 'Self');
          await this.resolveChild(core);
        }
        break;
      }
    }

    // フィールド効果
    this.processFieldEffect();
    await this.resolveChild(this.core);

    // ターンプレイヤーのフィールド上のカードを処理
    for (const unit of field.turnPlayer) {
      if (!turnPlayer.field.find(u => u.id === unit.id) || unit.hasKeyword('沈黙')) continue;
      await this.processCardEffect(unit, core);
      await this.resolveChild(core);
    }

    // 非ターンプレイヤーのフィールド上のカードを処理
    if (nonTurnPlayer) {
      for (const unit of field.nonTurnPlayer) {
        if (!nonTurnPlayer.field.find(u => u.id === unit.id) || unit.hasKeyword('沈黙')) continue;
        await this.processCardEffect(unit, core);
        await this.resolveChild(core);
      }
    }

    // NOTE: 現在のところ 捨札中で効果が発動するカードは turnStart と turnEnd のみ
    if (this.type === 'turnStart' || this.type === 'turnEnd') {
      // ターンプレイヤーの捨札のカードを処理
      for (const card of turnPlayer.trash) {
        await this.processCardEffect(card, core, 'InTrash');
        await this.resolveChild(core);
      }

      // 非ターンプレイヤーの捨札のカードを処理
      if (nonTurnPlayer)
        for (const card of nonTurnPlayer.trash) {
          await this.processCardEffect(card, core, 'InTrash');
          await this.resolveChild(core);
        }
    }

    // ターンプレイヤーのトリガーゾーン上のトリガーカードを処理
    let index = 0;
    while (turnPlayer.trigger.length > index) {
      const card = turnPlayer.trigger[index];
      if (card === undefined) {
        break;
      }

      const catalog = master.get(card?.catalogId);
      if (catalog === undefined) {
        throw new Error('不正なカードが指定されました');
      }

      if (catalog.type === 'trigger') {
        const result = await this.processTriggerCardEffect(card, core);
        await this.resolveChild(core);
        if (!result) index++;
      } else {
        index++;
        continue;
      }
    }

    // 非ターンプレイヤーのトリガーゾーン上のトリガーカードを処理
    index = 0;
    if (nonTurnPlayer)
      while (nonTurnPlayer.trigger.length > index) {
        const card = nonTurnPlayer.trigger[index];
        if (card === undefined) {
          break;
        }

        const catalog = master.get(card?.catalogId);
        if (catalog === undefined) {
          throw new Error('不正なカードが指定されました');
        }

        if (catalog.type === 'trigger') {
          this.processing = card;
          const result = await this.processTriggerCardEffect(card, core);
          this.processing = undefined;
          await this.resolveChild(core);
          if (!result) index++;
        } else {
          index++;
          continue;
        }
      }

    // トリガーゾーン上のインターセプトカードを処理
    let canceled = 0;
    const player: Player[] = [turnPlayer, nonTurnPlayer].filter(p => p !== undefined);
    index = 0;
    do {
      if (await this.processUserInterceptInteract(core, player[index % player.length]!)) {
        canceled += 1;
      } else {
        canceled = 0;
      }
      await this.resolveChild(core);
      index++;
    } while (canceled < player.length);

    // deltaを更新
    // 寿命カウンタ系は core 側でチェックされる
    [
      ...turnPlayer.field,
      ...turnPlayer.hand,
      ...(nonTurnPlayer?.field ?? []),
      ...(nonTurnPlayer?.hand ?? []),
    ].forEach(card => {
      this.processing = card;
      card.delta = card.delta.filter(
        delta =>
          !delta.checkExpire(this as StackWithCard) ||
          delta.effect.type === 'death' ||
          delta.effect.type === 'life'
      );
      this.processing = undefined;
    });
  }

  private async resolveChild(core: Core): Promise<void> {
    for (const child of this.children) {
      await child.resolve(core);
    }

    // Stackによって移動が約束されたユニットを移動させる
    if (this.children.length > 0) await new Promise(resolve => setTimeout(resolve, 500));
    const isProcessed = this.children.map(stack => {
      const target = stack.target as Unit;

      switch (stack.type) {
        case 'break':
          this.moveUnit(target, 'trash');
          return true;
        case 'delete':
          this.moveUnit(target, 'delete', 'deleted');
          return true;
        case 'bounce':
          if (stack.option?.type === 'bounce') {
            this.moveUnit(target, stack.option?.location, 'bounce');
          }
          return true;
      }
    });

    this.children = [];
    if (isProcessed.includes(true)) {
      this.core.room.sync();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private moveUnit(target: Unit, destination: CardArrayKeys, sound: string = 'leave') {
    const owner = target.owner;
    // ターゲットがフィールドに残留しているかチェック
    const isOnField = owner.field.some(unit => unit.id === target.id);

    // destinationに送る
    if (isOnField) {
      console.log('%s を %s に移動', target.catalog.name, destination);
      this.core.room.soundEffect(sound);
      owner.field = owner.field.filter(unit => unit.id !== target.id);
      target.reset();

      // コピーまたはウィルスは移動させない (ゲームから除外)
      if (target.isCopy || target.catalog.species?.includes('ウィルス')) return;

      const actualDestination =
        destination === 'hand' && owner.hand.length >= this.core.room.rule.player.max.hand
          ? 'trash'
          : destination;
      if (actualDestination !== 'hand' && actualDestination !== 'trigger') target.delta = []; // 手札領域でない場合はDeltaを完全に除去する
      this.core.fieldEffectUnmount(target);
      owner[actualDestination].push(target);
    }
  }

  /**
   * プレイヤーのインターセプト使用をチェックする
   * @param player 対象のプレイヤー
   * @returns プレイヤーがインターセプトの利用をキャンセルした場合か、利用できるカードがない場合にのみ true を返す
   */
  private async processUserInterceptInteract(core: Core, player: Player): Promise<boolean> {
    // 使用可能なカードを列挙
    const targets = player.trigger.filter(card => {
      const checkerName = `check${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`;
      const catalog = master.get(card.catalogId);
      if (!catalog) throw new Error('不正なカードが指定されました');

      // 使用者のフィールドに該当色のユニットが存在するか
      const isOnFieldSameColor =
        card.catalog.color === Color.NONE ||
        player.field.some(u => u.catalog.color === card.catalog.color);

      // CPが足りているか
      const isEnoughCP =
        card.catalog.cost -
          card.delta
            .map(delta => (delta.effect.type === 'cost' ? delta.effect.value : 0))
            .reduce((acc, cur) => acc + cur, 0) <=
        player.cp.current;

      this.processing = card;

      return (
        isOnFieldSameColor &&
        isEnoughCP &&
        (typeof catalog[checkerName] === 'function'
          ? catalog.type === 'intercept' && catalog[checkerName](this)
          : false)
      );
    });

    if (targets.length === 0) return true;

    // クライアントに送信して返事を待つ
    const [selected] = await System.prompt(this, player.id, {
      title: '入力受付中',
      type: 'intercept',
      items: targets,
    });

    if (selected) {
      const card = player.trigger.find(c => c.id === selected);
      if (!card) throw new Error('対象がトリガーゾーンに存在しません');

      const effectHandler = `on${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`;
      const catalog = master.get(card.catalogId);
      if (!catalog) throw new Error('不正なカードが指定されました');
      if (typeof catalog[effectHandler] === 'function') {
        // 効果実行前に通知
        core.room.broadcastToAll(
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
                player: card.owner.id,
                type: 'INTERCEPT',
              },
            },
          })
        );

        player.trigger = player.trigger.filter(c => c.id !== card.id);
        player.called.push(card);

        const cost =
          card.catalog.cost -
          card.delta
            .map(delta => (delta.effect.type === 'cost' ? delta.effect.value : 0))
            .reduce((acc, cur) => acc + cur, 0);
        player.cp.current -= cost;
        if (cost > 0) this.core.room.soundEffect('cp-consume');
        core.room.sync();

        this.processing = card;
        await catalog[effectHandler](this);
        this.processing = undefined;

        // 発動したインターセプトカードを捨札に送る
        card.lv = 1;
        player.called = player.called.filter(c => c.id !== card.id);
        player.trash.push(card);
        core.room.sync();

        // インターセプトカード発動スタックを積む
        this.addChildStack('intercept', player, card);
        return false;
      }
    }

    return true;
  }

  /**
   * 個別のカードに対して、このスタックタイプに対応する効果を処理する
   * @param card 処理対象のカード
   * @param core ゲームのコアインスタンス
   */
  private async processCardEffect(card: Card, core: Core, suffix: string = ''): Promise<void> {
    // カタログからこのスタックタイプに対応する効果関数名を生成
    // 例: type='drive' の場合、'onDrive'
    const handlerName = `on${this.type.charAt(0).toUpperCase() + this.type.slice(1) + suffix}`;

    // カタログからハンドラー関数を取得
    const effectHandler = card.catalog[handlerName];

    if (typeof effectHandler === 'function') {
      try {
        // 効果を実行
        await new Promise(resolve => setTimeout(resolve, 500));
        this.processing = card;
        await effectHandler(this);
        this.processing = undefined;
        core.room.sync();
      } catch (error) {
        if (error instanceof Parry) throw error;
        console.error(`Error processing effect ${handlerName} for card ${card.id}:`, error);
      }
    }
  }

  /**
   * トリガーゾーン上のカードを処理する
   * @param card 処理対象のカード
   * @param core ゲームのコアインスタンス
   */
  private async processTriggerCardEffect(card: Card, core: Core): Promise<boolean> {
    // IAtomはcatalogIdを持っていない可能性があるのでチェック
    const catalogId = card.catalogId;
    if (!catalogId) return false;

    // カードのカタログデータを取得
    const cardCatalog: CatalogWithHandler | undefined = master.get(catalogId);
    if (!cardCatalog) return false;

    // カタログからこのスタックタイプに対応する効果関数名を生成
    // 例: type='drive' の場合、'onDrive'
    const checkerName = `check${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`;
    const handlerName = `on${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`;

    // カタログからハンドラー関数を取得
    const effectChecker = cardCatalog[checkerName];
    const effectHandler = cardCatalog[handlerName];

    if (typeof effectChecker === 'function' && typeof effectHandler === 'function') {
      try {
        // 効果チェックを実行
        this.processing = card;
        const check: boolean = await effectChecker(this);
        this.processing = undefined;

        // 効果実行後に通知
        core.room.broadcastToAll(
          createMessage({
            action: {
              type: 'debug',
              handler: 'client',
            },
            payload: {
              type: 'DebugPrint',
              message: {
                stackId: this.id,
                card: master.get(card.catalogId)?.name,
                effectType: this.type,
                state: check ? 'call' : 'through',
              },
            },
          })
        );

        // 効果を呼び出せる状況であれば呼び出す
        if (check) {
          // トリガーゾーンからカードを取り除く
          const owner = card.owner;
          owner.trigger = owner.trigger.filter(c => c.id !== card.id);
          owner.called.push(card);
          core.room.sync();

          // 効果実行前に通知
          core.room.broadcastToAll(
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
                  player: owner.id,
                  type: 'TRIGGER',
                },
              },
            })
          );

          // 呼び出す
          this.processing = card;
          await effectHandler(this);
          this.processing = undefined;

          // 発動したトリガーカードを捨札に送る
          card.lv = 1;
          owner.called = owner.called.filter(c => c.id !== card.id);
          owner.trash.push(card);

          // トリガーカード発動スタックを積む
          this.addChildStack('trigger', owner, card);
        }
        core.room.sync();
        return check;
      } catch (error) {
        if (error instanceof Parry) throw error;
        console.error(`Error processing effect ${handlerName} for card ${card.id}:`, error);
      }
    }

    return false;
  }

  /**
   * 新しい子スタックを作成して追加する
   * @param type スタックのタイプ
   * @param source 効果の発生源
   * @param target 効果の対象
   * @returns 作成されたスタック
   */
  addChildStack(
    type: string,
    source: Card | Player,
    target?: Card | Player,
    option?: StackOption
  ): Stack {
    const childStack = new Stack({
      type,
      source,
      target,
      parent: this,
      core: this.core,
      option,
    });

    this.children.push(childStack);
    return childStack;
  }

  /**
   * スタックのIDを取得する（ユニークな識別子として使用）
   */
  get id(): string {
    return `${this.source.id}_${this.type}_${Date.now()}`;
  }

  private processFieldEffect() {
    const target = this.target instanceof Card ? this.target.catalog.name : '?';
    const source = this.source instanceof Card ? this.source.catalog.name : '?';
    console.log('%s -> %s による %s の発生で、フィールド効果呼び出し', source, target, this.type);
    this.core.players
      .flatMap(player => player.field)
      .forEach(unit => {
        if (
          'fieldEffect' in unit.catalog &&
          typeof unit.catalog.fieldEffect === 'function' &&
          !unit.hasKeyword('沈黙')
        ) {
          this.processing = unit;
          unit.catalog.fieldEffect(this);
          this.processing = undefined;

          // このフィールド効果による影響を確認
          this.breakCheck(unit);
        }
      });

    this.core.players
      .flatMap(player => [...player.hand, ...player.trigger])
      .forEach(card => {
        if ('handEffect' in card.catalog && typeof card.catalog.handEffect === 'function') {
          card.catalog.handEffect(this.core, card);
        }
      });

    this.core.room.sync(true);
  }

  private breakCheck(effector: Unit) {
    this.core.players
      .flatMap(player => player.field)
      .forEach(unit => {
        if (unit.currentBP <= 0 && unit.destination === undefined)
          Effect.break(this, effector, unit, 'effect');
      });
  }
}
