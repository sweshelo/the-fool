import { createMessage } from '@/submodule/suit/types';
import { Player } from './Player';
import type { Core } from '../core';
import type { CatalogWithHandler } from '@/database/factory';
import master from '@/database/catalog';
import { EffectHelper } from '@/database/effects/classes/helper';
import { Card, Unit } from './card';
import { System } from '@/database/effects';

interface IStack {
  /**
   * @param type そのStackのタイプを示す
   */
  type: string;
  /**
   * @param source そのStackを発生させたカードを示す。例えば召喚操作の場合、召喚されたUnitがここに指定される。
   */
  source: Card | Player;
  /**
   * @param target そのStackによって影響を受ける対象を示す。例えば破壊効果の場合、破壊されたUnitがここに指定される。
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
}

export class Stack implements IStack {
  type: string;
  source: Card | Player;
  target?: Card | Player;
  parent: undefined | Stack;
  children: Stack[];
  core: Core;
  processing: Card | undefined;

  constructor({ type, source, target, parent, core }: Omit<IStack, 'children'>) {
    this.type = type;
    this.source = source;
    this.target = target;
    this.parent = parent;
    this.children = [];
    this.core = core;
  }

  /**
   * スタックの効果を処理する
   * ターンプレイヤーのカード、非ターンプレイヤーのカードの順に処理する
   * @param core ゲームのコアインスタンス
   */
  async resolve(core: Core): Promise<void> {
    // ターンプレイヤーを取得
    const turnPlayerId = core.getTurnPlayerId();
    if (!turnPlayerId) return;

    const turnPlayer = core.players.find(p => p.id === turnPlayerId);
    const nonTurnPlayer = core.players.find(p => p.id !== turnPlayerId);
    if (!turnPlayer) return;

    if (this.type === 'overclock' && this.target instanceof Unit) {
      this.target.overclocked = true;
      core.room.broadcastToAll(
        createMessage({
          action: {
            type: 'effect',
            handler: 'client',
          },
          payload: {
            type: 'SoundEffect',
            soundId: 'clock-up-field',
          },
        })
      );
    }

    // まず source カードの効果を処理
    if (this.source instanceof Card) {
      await this.processCardEffect(this.source, core, true);
      await this.resolveChild(core);
    }

    // ターンプレイヤーのフィールド上のカードを処理 (source以外)
    for (const unit of turnPlayer.field.filter(u => u.id !== this.source.id)) {
      await this.processCardEffect(unit, core, false);
      await this.resolveChild(core);
    }

    // 非ターンプレイヤーのフィールド上のカードを処理
    if (nonTurnPlayer)
      for (const unit of nonTurnPlayer.field) {
        await this.processCardEffect(unit, core, false);
        await this.resolveChild(core);
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
    do {
      const turnPlayerCanceled = await this.processUserInterceptInteract(core, turnPlayer);
      await this.resolveChild(core);

      const nonTurnPlayerCanceled =
        !nonTurnPlayer || (await this.processUserInterceptInteract(core, nonTurnPlayer));
      await this.resolveChild(core);

      if (turnPlayerCanceled && nonTurnPlayerCanceled) break;
      // eslint-disable-next-line no-constant-condition
    } while (true);
  }

  private async resolveChild(core: Core): Promise<void> {
    for (const child of this.children) {
      console.log('子スタック解決!');
      await child.resolve(core);
    }

    // Stackによって移動が約束されたユニットを移動させる
    if (this.children.length > 0) await new Promise(resolve => setTimeout(resolve, 500));
    this.children.forEach(stack => {
      switch (stack.type) {
        case 'break': {
          const broken: Unit = stack.target as Unit;
          const owner = EffectHelper.owner(core, broken);

          // ターゲットがフィールドに残留しているかチェック
          const isOnField = owner.field.some(unit => unit.id === broken.id);
          // 捨札に送る
          if (isOnField) {
            owner.field = owner.field.filter(unit => unit.id !== broken.id);
            broken.lv = 1;
            owner.trash.unshift(broken);
            core.room.broadcastToAll({
              action: {
                type: 'effect',
                handler: 'client',
              },
              payload: {
                type: 'SoundEffect',
                soundId: 'leave',
              },
            });
            core.room.sync();
          }
          break;
        }
      }
    });

    this.children = [];
  }

  /**
   * プレイヤーのインターセプト使用をチェックする
   * @param player 対象のプレイヤー
   * @returns プレイヤーがインターセプトの利用をキャンセルした場合が、利用できるカードがない場合にのみ true を返す
   */
  private async processUserInterceptInteract(core: Core, player: Player): Promise<boolean> {
    // 使用可能なカードを列挙
    const targets = player.trigger.filter(card => {
      const checkerName = `check${this.type.charAt(0).toUpperCase() + this.type.slice(1)}`;
      const catalog = master.get(card.catalogId);
      if (!catalog) throw new Error('不正なカードが指定されました');
      console.log(catalog.name, checkerName);

      // 使用者のフィールドに該当色のユニットが存在するか
      const isOnFieldSameColor = player.field.some(u => u.catalog().color === card.catalog().color);

      this.processing = card;
      return (
        isOnFieldSameColor &&
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
        player.trigger = player.trigger.filter(c => c.id !== card.id);
        player.called.push(card);
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
                image: `https://coj.sega.jp/player/img/${card.catalog().img}`,
                player: EffectHelper.owner(core, card).id,
                type: 'INTERCEPT',
              },
            },
          })
        );

        this.processing = card;
        await catalog[effectHandler](this);
        this.processing = undefined;

        // 発動したインターセプトカードを捨札に送る
        card.lv = 1;
        player.called = player.called.filter(c => c.id !== card.id);
        player.trash.unshift(card);
        core.room.sync();

        // インターセプトカード発動スタックを積む
        this.addChildStack('intercept', card);
      }
    } else {
      return true;
    }
    return false;
  }

  /**
   * 個別のカードに対して、このスタックタイプに対応する効果を処理する
   * @param card 処理対象のカード
   * @param core ゲームのコアインスタンス
   */
  private async processCardEffect(card: Card, core: Core, self: boolean): Promise<void> {
    // IAtomはcatalogIdを持っていない可能性があるのでチェック
    const catalogId = card.catalogId;
    if (!catalogId) return;

    // カードのカタログデータを取得
    const cardCatalog: CatalogWithHandler | undefined = master.get(catalogId);
    if (!cardCatalog) return;

    // カタログからこのスタックタイプに対応する効果関数名を生成
    // 例: type='drive' の場合、'onDrive'
    const handlerName = `on${this.type.charAt(0).toUpperCase() + this.type.slice(1) + (self ? 'Self' : '')}`;

    // カタログからハンドラー関数を取得
    const effectHandler = cardCatalog[handlerName];

    if (typeof effectHandler === 'function') {
      try {
        // 効果実行前に通知
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
                state: 'start',
              },
            },
          })
        );

        // 効果を実行
        await new Promise(resolve => setTimeout(resolve, 500));
        this.processing = card;
        await effectHandler(this);
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
                state: 'end',
              },
            },
          })
        );
      } catch (error) {
        console.error(`Error processing effect ${handlerName} for card ${card.id}:`, error);
      } finally {
        // 処理が終わったら状態を同期
        core.room.sync();
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
          const owner = EffectHelper.owner(core, card);
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
                  image: `https://coj.sega.jp/player/img/${card.catalog().img}`,
                  player: EffectHelper.owner(core, card).id,
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
          owner.called.filter(c => c.id !== card.id);
          owner.trash.unshift(card);

          // トリガーカード発動スタックを積む
          this.addChildStack('trigger', card);
        }

        return check;
      } catch (error) {
        console.error(`Error processing effect ${handlerName} for card ${card.id}:`, error);
      } finally {
        // 処理が終わったら状態を同期
        core.room.sync();
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
  addChildStack(type: string, source: Card, target?: Card | Player): Stack {
    const childStack = new Stack({
      type,
      source,
      target,
      parent: this,
      core: this.core,
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
}
