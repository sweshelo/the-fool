import { createMessage, type IAtom, type ICard } from '@/submodule/suit/types';
import type { Player } from './Player';
import type { Core } from '../core';
import type { CatalogWithHandler } from '@/database/factory';
import master from '@/database/catalog';
import type { Choices } from '@/submodule/suit/types/game/system';
import { EffectHelper } from '@/database/effects/helper';

interface IStack {
  /**
   * @param type そのStackのタイプを示す
   */
  type: string;
  /**
   * @param source そのStackを発生させたカードを示す。例えば召喚操作の場合、召喚されたUnitがここに指定される。
   */
  source: IAtom;
  /**
   * @param target そのStackによって影響を受ける対象を示す。例えば破壊効果の場合、破壊されたUnitがここに指定される。
   */
  target?: IAtom | Player;
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
}

export class Stack implements IStack {
  type: string;
  source: IAtom;
  target?: IAtom | Player;
  parent: undefined | Stack;
  children: Stack[];

  constructor({ type, source, target, parent }: Omit<IStack, 'children'>) {
    this.type = type;
    this.source = source;
    this.target = target;
    this.parent = parent;
    this.children = [];
  }

  /**
   * スタックの解決処理を行う
   * 自身の効果を処理した後、子スタックを順番に処理する
   * @param core ゲームのコアインスタンス
   */
  async resolve(core: Core): Promise<void> {
    // スタックの処理開始をクライアントに通知
    await this.notifyStackProcessing(core, 'start');

    // 1. 自身の効果を処理
    await this.processEffect(core);

    // 2. 子スタックを順番に処理 (深さ優先で処理)
    for (const child of this.children) {
      await child.resolve(core);
    }

    // スタックの処理完了をクライアントに通知
    await this.notifyStackProcessing(core, 'end');
  }

  /**
   * スタックの処理状態をクライアントに通知する
   * @param core ゲームのコアインスタンス
   * @param state 処理の状態 ('start'|'end')
   */
  private async notifyStackProcessing(core: Core, state: 'start' | 'end'): Promise<void> {
    // 通知メッセージを送信
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
            stackType: this.type,
            state: state,
            source: this.source ? { id: this.source.id } : undefined,
            target: this.target ? { id: (this.target as IAtom).id } : undefined,
          },
        },
      })
    );

    // 少し待機してアニメーションなどの時間を確保
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  /**
   * スタックの効果を処理する
   * ターンプレイヤーのカード、非ターンプレイヤーのカードの順に処理する
   * @param core ゲームのコアインスタンス
   */
  private async processEffect(core: Core): Promise<void> {
    // ターンプレイヤーを取得
    const turnPlayerId = core.getTurnPlayerId();
    if (!turnPlayerId) return;

    const turnPlayer = core.players.find(p => p.id === turnPlayerId);
    const nonTurnPlayer = core.players.find(p => p.id !== turnPlayerId);
    if (!turnPlayer) return;

    // まず source カードの効果を処理
    await this.processCardEffect(this.source as ICard, core, true);

    // ターンプレイヤーのフィールド上のカードを処理 (source以外)
    for (const unit of turnPlayer.field.filter(u => u.id !== this.source.id)) {
      await this.processCardEffect(unit, core, false);
    }

    // 非ターンプレイヤーのフィールド上のカードを処理
    if (nonTurnPlayer)
      for (const unit of nonTurnPlayer.field) {
        await this.processCardEffect(unit, core, false);
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
          if (!result) index++;
        } else {
          index++;
          continue;
        }
      }

    // トリガーゾーン上のインターセプトカードを処理
    let finish = false;
    do {
      finish =
        (await this.processUserInterceptInteract(core, turnPlayer)) &&
        (!nonTurnPlayer || (await this.processUserInterceptInteract(core, nonTurnPlayer)));
    } while (!finish);
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
      return typeof catalog[checkerName] === 'function'
        ? catalog.type === 'intercept' && catalog[checkerName](this, card, core)
        : false;
    });

    if (targets.length === 0) return true;

    // クライアントに送信して返事を待つ
    const [selected] = await this.promptUserChoice(core, player.id, {
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

        await catalog[effectHandler](this, card, core);

        // 発動したインターセプトカードを捨札に送る
        player.called.filter(c => c.id !== card.id);
        player.trash.unshift(card);
        core.room.sync();
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
  private async processCardEffect(card: ICard, core: Core, self: boolean): Promise<void> {
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
        await effectHandler(this, card, core);

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
  private async processTriggerCardEffect(card: ICard, core: Core): Promise<boolean> {
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

        // 効果チェックを実行
        const check: boolean = await effectChecker(this, card, core);

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

          // 呼び出す
          await effectHandler(this, card, core);

          // 発動したトリガーカードを捨札に送る
          owner.called.filter(c => c.id !== card.id);
          owner.trash.unshift(card);
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
   * ユーザーに選択を促す
   * @param core ゲームのコアインスタンス
   * @param playerId 選択を行うプレイヤーID
   * @param choises 選択肢の配列
   * @param message 表示メッセージ
   * @returns 選択された選択肢
   */
  async promptUserChoice(core: Core, playerId: string, choices: Choices): Promise<string[]> {
    // 一意のプロンプトIDを生成
    const promptId = `${this.id}_${Date.now()}`;

    // クライアントに選択肢を送信
    core.room.broadcastToPlayer(
      playerId,
      createMessage({
        action: {
          type: 'pause',
          handler: 'client',
        },
        payload: {
          type: 'Choices',
          promptId,
          choices,
          player: playerId,
        },
      })
    );

    // クライアントからの応答を待つ
    return new Promise(resolve => {
      core.setEffectDisplayHandler(promptId, (choice: string[]) => {
        resolve(choice);
      });
    });
  }

  /**
   * ユーザーに効果内容を表示する
   * @param core ゲームのコアインスタンス
   * @param title 効果名
   * @param message 表示メッセージ
   */
  async displayEffect(core: Core, title: string, message: string): Promise<void> {
    // 一意のプロンプトIDを生成
    const promptId = `${this.id}_${Date.now()}`;

    // クライアントに選択肢を送信
    core.room.broadcastToAll(
      createMessage({
        action: {
          type: 'pause',
          handler: 'client',
        },
        payload: {
          type: 'DisplayEffect',
          promptId,
          stackId: this.id,
          title,
          message,
        },
      })
    );

    // クライアントからの応答を待つ
    return new Promise(resolve => {
      core.setEffectDisplayHandler(promptId, () => {
        resolve();
      });
    });
  }

  /**
   * 新しい子スタックを作成して追加する
   * @param type スタックのタイプ
   * @param source 効果の発生源
   * @param target 効果の対象
   * @returns 作成されたスタック
   */
  addChildStack(type: string, source: IAtom, target?: IAtom | Player): Stack {
    const childStack = new Stack({
      type,
      source,
      target,
      parent: this,
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
