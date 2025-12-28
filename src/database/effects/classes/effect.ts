import type { Stack } from '@/package/core/class/stack';
import { Evolve, Unit, type Card } from '@/package/core/class/card';
import type { CardArrayKeys, Player } from '@/package/core/class/Player';
import { Delta, type DeltaSource } from '@/package/core/class/delta';
import { createMessage, type KeywordEffect } from '@/submodule/suit/types';

const sendSelectedVisualEffect = (stack: Stack, target: Unit) => {
  // クライアントにエフェクトを送信
  stack.core.room.broadcastToAll(
    createMessage({
      action: {
        type: 'effect',
        handler: 'client',
      },
      payload: {
        type: 'VisualEffect',
        body: {
          effect: 'select',
          unitId: target.id,
        },
      },
    })
  );
};

interface KeywordOptionParams {
  event?: string;
  count?: number;
  cost?: number;
  onlyForOwnersTurn?: boolean;
  source?: DeltaSource;
}

type ModifyBPOption =
  | {
      isBaseBP: true;
    }
  | {
      event: Delta['event'];
      count: Delta['count'];
    }
  | {
      source: Delta['source'];
    };

export class Effect {
  /**
   * 対象にダメージを与える
   * @param stack 親スタック
   * @param source ダメージを与える効果を発動したカード
   * @param target ダメージを受けるユニット
   * @param value ダメージ量
   * @param type ダメージのタイプ
   * @returns 対象が破壊される場合は true を、そうでない場合は false を返す
   */
  static damage(
    stack: Stack,
    source: Card,
    target: Unit,
    value: number,
    type: 'effect' | 'battle' = 'effect'
  ): boolean | undefined {
    // 対象がフィールド上に存在するか確認
    const exists = target.owner.find(target);
    const isOnField = exists.result && exists.place?.name === 'field';
    if (!isOnField) throw new Error('対象が見つかりませんでした');

    // 既に破壊されているユニットにはダメージを与えない
    if (target.destination !== undefined) {
      stack.addChildStack('damage', source, target, {
        type: 'damage',
        cause: type,
        value,
      });
      return false;
    }

    // 実際のダメージ量を計算
    const damage = type === 'effect' && target.hasKeyword('オーバーヒート') ? value * 2 : value;

    // 耐性チェック
    // 【不滅】: ダメージを受けない
    const hasImmotal = target.hasKeyword('不滅');
    // 【秩序の盾】: 対戦相手の効果によるダメージを受けない
    const hasOrderShield =
      target.hasKeyword('秩序の盾') && type === 'effect' && source.owner.id !== target.owner.id;
    // 【王の治癒力】: 自身のBP未満のダメージを受けない
    const hasKingsHealing = target.hasKeyword('王の治癒力') && target.currentBP > damage;
    if (hasImmotal || hasOrderShield || hasKingsHealing) {
      stack.core.room.soundEffect('block');
      return false;
    }

    if (
      !target.hasKeyword('沈黙') &&
      target.catalog.name === '戦女神ジャンヌダルク' &&
      type === 'effect'
    ) {
      stack.core.room.soundEffect('block');
      stack.core.room.broadcastToAll(
        createMessage({
          action: {
            type: 'effect',
            handler: 'client',
          },
          payload: {
            type: 'VisualEffect',
            body: {
              effect: 'status',
              type: 'base-bp',
              value: damage,
              unitId: target.id,
            },
          },
        })
      );
      target.bp += damage;
      return false;
    }

    // エフェクトを発行
    stack.core.room.broadcastToAll(
      createMessage({
        action: {
          type: 'effect',
          handler: 'client',
        },
        payload: {
          type: 'VisualEffect',
          body: {
            effect: 'status',
            type: 'damage',
            value: damage,
            unitId: target.id,
          },
        },
      })
    );

    target.delta.push(new Delta({ type: 'damage', value: damage }, { event: 'turnEnd', count: 1 }));
    stack.addChildStack('damage', source, target, {
      type: 'damage',
      cause: type,
      value: damage,
    });

    if (type !== 'battle') {
      stack.core.room.soundEffect('damage');
    }

    // 破壊された?
    if (target.currentBP <= 0) {
      Effect.break(stack, source, target, 'damage');
      return true;
    }

    return false;
  }

  /**
   * 対象のBPを操作する
   * @param stack 親スタック
   * @param source BPを変動させる効果を発動したカード
   * @param target BPが変動するユニット
   * @param value 操作量
   * @returns この効果で相手を破壊した時は true を返す
   */
  static modifyBP(stack: Stack, source: Card, target: Unit, value: number, option: ModifyBPOption) {
    // 対象がフィールド上に存在するか確認
    const exists = target.owner.find(target);
    const isOnField = exists.result && exists.place?.name === 'field';
    if (!isOnField) throw new Error('対象が見つかりませんでした');

    // 既に破壊されているユニットのBPは変動させない
    if (target.destination !== undefined) return false;

    // 変化量がなければ中断する
    if (value === 0) return false;

    if ('isBaseBP' in option) {
      target.bp += value;
    } else if ('source' in option) {
      target.delta.push(new Delta({ type: 'bp', diff: value }, { source: option.source }));
    } else {
      target.delta.push(
        new Delta({ type: 'bp', diff: value }, { event: option.event, count: option.count })
      );
    }

    stack.core.room.broadcastToAll(
      createMessage({
        action: {
          type: 'effect',
          handler: 'client',
        },
        payload: {
          type: 'VisualEffect',
          body: {
            effect: 'status',
            type: 'isBaseBP' in option ? 'base-bp' : 'bp',
            value,
            unitId: target.id,
          },
        },
      })
    );

    stack.core.room.soundEffect(value >= 0 ? 'grow' : 'damage');

    if (target.currentBP <= 0) {
      Effect.break(stack, source, target, 'effect');
      return true;
    }

    return false;
  }

  /**
   * ユニットを破壊する
   * ! フィールド上のユニット以外を破壊する場合はこのメソッドではなく Effect.handes() や Effect.move() で捨札に送る操作を実行します。
   * @param source 効果の発動元
   * @param target 破壊の対象
   * @param cause その破壊の原因 (カードテキストの実装にあたっては基本的にeffect以外使用してはいけない)
   */
  static break(
    stack: Stack,
    source: Card,
    target: Unit,
    cause: 'effect' | 'damage' | 'battle' | 'death' | 'system' = 'effect'
  ): void {
    // 対象がフィールド上に存在するか確認
    const exists = target.owner.find(target);
    const isOnField =
      exists.result && exists.place?.name === 'field' && target.destination !== 'trash';

    if (!isOnField) return;

    // 【破壊効果耐性】: 対戦相手の効果によって破壊されない
    if (
      cause === 'effect' &&
      target.hasKeyword('破壊効果耐性') &&
      source.owner.id !== target.owner.id
    ) {
      stack.core.room.soundEffect('block');
      return;
    }

    stack.addChildStack('break', source, target, {
      type: 'break',
      cause,
    });
    target.destination = 'trash';
    stack.core.room.soundEffect('bang');
    sendSelectedVisualEffect(stack, target);
  }

  /**
   * 対象を消滅させる
   * ! フィールド上のユニット以外を消滅させる場合はこのメソッドではなく Effect.move() で消滅札に送る操作を実行します。
   * @param source 効果の発動元
   * @param target 消滅の対象
   */
  static delete(stack: Stack, source: Card, target: Unit): void {
    // 対象がフィールド上に存在するか確認
    const exists = target.owner.find(target);
    const isOnField =
      exists.result && exists.place?.name === 'field' && target.destination !== 'delete';

    if (!isOnField) return;

    // 【消滅効果耐性】: 対戦相手の効果によって消滅しない
    if (target.hasKeyword('消滅効果耐性') && source.owner.id !== target.owner.id) {
      stack.core.room.soundEffect('block');
      return;
    }

    stack.addChildStack('delete', source, target);
    target.destination = 'delete';
    stack.core.room.soundEffect('bang');
    sendSelectedVisualEffect(stack, target);
  }

  /**
   * 対象を移動させる
   * @param source 効果の発動元
   * @param target 移動の対象
   */
  static bounce(
    stack: Stack,
    source: Card,
    target: Unit,
    location: 'hand' | 'deck' | 'trigger' = 'hand'
  ): void {
    // 対象がフィールド上に存在するか確認
    const exists = target.owner.find(target);
    const isOnField =
      exists.result && exists.place?.name === 'field' && target.destination !== location;

    if (!isOnField) return;

    console.log(
      '[発動] %s の効果によって %s を %s に移動',
      source.catalog.name,
      target.catalog.name,
      location
    );

    // 【固着】: 対戦相手の効果によって手札に戻らない
    if (location === 'hand' && target.hasKeyword('固着') && source.owner.id !== target.owner.id) {
      stack.core.room.soundEffect('block');
      return;
    }

    stack.addChildStack('bounce', source, target, {
      type: 'bounce',
      location,
    });
    target.destination = location;
    stack.core.room.soundEffect('bang');
    sendSelectedVisualEffect(stack, target);
  }

  /**
   * 効果によって手札を捨てさせる
   * @param source 効果の発動元
   * @param target 破壊する手札
   */
  static handes(stack: Stack, source: Card, target: Card): void {
    const owner = target.owner;
    const card = owner.find(target);

    if (card.place?.name === 'hand') {
      target.lv = 1;
      owner.hand = owner.hand.filter(c => c.id !== target.id);
      owner.trash.push(target);
      stack.core.room.sync();
      stack.core.room.soundEffect('destruction');

      stack.addChildStack('handes', source, target);
    }
  }

  /**
   * 効果によってカードを移動させる
   * ! 手札を捨てる動作は `handes` を利用する
   * @param source 効果の発動元
   * @param target 対象のカード
   * @param location 移動先
   * @returns void
   */
  static move(stack: Stack, source: Card, target: Card, location: CardArrayKeys): void {
    const owner = target.owner;
    const cardFind = owner.find(target);

    if (!cardFind.result || !cardFind.place) {
      throw new Error('対象が見つかりませんでした');
    }

    const origin = cardFind.place.name;

    // Type guard to check if the origin is a valid card location
    if (!['hand', 'trigger', 'deck', 'trash', 'field', 'delete'].includes(origin)) {
      throw new Error(`無効な移動元です: ${origin}`);
    }

    // Type guard to check if the location property exists on owner
    if (!(location in owner) || location === cardFind.place.name) {
      throw new Error(`無効な移動先です: ${location}`);
    }

    // 枚数上限付き領域には上限チェックを実施
    if (location === 'hand' && owner.hand.length >= stack.core.room.rule.player.max.hand) return;
    if (location === 'trigger' && owner.trigger.length >= stack.core.room.rule.player.max.trigger)
      return;

    switch (origin) {
      case 'hand':
        owner.hand = owner.hand.filter(c => c.id !== target.id);
        break;
      case 'trigger':
        owner.trigger = owner.trigger.filter(c => c.id !== target.id);
        break;
      case 'trash':
        owner.trash = owner.trash.filter(c => c.id !== target.id);
        break;
      case 'field':
        owner.field = owner.field.filter(c => c.id !== target.id);
        break;
      case 'deck':
        owner.deck = owner.deck.filter(c => c.id !== target.id);
        break;
      case 'delete':
        owner.delete = owner.delete.filter(c => c.id !== target.id);
        break;
    }

    target.reset();

    // Add card to destination location
    switch (location) {
      case 'hand':
        owner.hand.push(target);
        stack.core.room.soundEffect('draw');
        break;
      case 'trigger':
        owner.trigger.push(target);
        stack.core.room.soundEffect('trigger');
        break;
      case 'deck':
        owner.deck.push(target);
        break;
      case 'trash':
        if (origin === 'hand') stack.core.room.soundEffect('destruction');
        owner.trash.push(target);
        break;
      case 'delete':
        if (origin === 'hand') stack.core.room.soundEffect('destruction');
        owner.delete.push(target);
    }

    if (origin === 'trigger' && location === 'trash') {
      stack.core.room.soundEffect('destruction');
      stack.addChildStack('lost', source, target);
    } else {
      stack.addChildStack('move', source, target);
    }
  }

  static modifyCP(stack: Stack, source: Card, target: Player, value: number): void {
    if (value === 0) return;

    const updatedCP = Math.max(
      Math.min(target.cp.current + value, stack.core.room.rule.system.cp.ceil),
      0
    );
    const actualDiff = updatedCP - target.cp.current;
    target.cp.current = updatedCP;

    if (value > 0) {
      if (actualDiff > 0) stack.core.room.soundEffect('cp-increase');
    } else {
      if (actualDiff < 0) stack.core.room.soundEffect('cp-consume');
    }

    stack.addChildStack('modifyCP', source, target, {
      type: 'cp',
      value,
    });
  }

  /**
   * 紫ゲージを操作する
   * @param stack
   * @param source 効果の発動元
   * @param target 対象のプレイヤー
   * @param value 増減量
   */
  static async modifyPurple(
    stack: Stack,
    source: Card,
    target: Player,
    value: number
  ): Promise<void> {
    if (value === 0) return;

    if (target.purple === undefined) target.purple = 0;
    const updatedPurple = Math.min(Math.max(target.purple + value, 0), 5);

    stack.addChildStack('modifyPurple', source, target, {
      type: 'purple',
      value,
    });

    // 演出
    const count = Math.abs(updatedPurple - (target.purple ?? 0));
    for (let i = 0; i < count; i++) {
      if (value > 0) {
        stack.core.room.soundEffect('purple-increase');
        target.purple += 1;
      } else {
        stack.core.room.soundEffect('purple-consume');
        target.purple -= 1;
      }
      stack.core.room.sync();
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  /**
   * クロックレベルを操作する
   * @param stack
   * @param source 効果の発動元
   * @param target 効果の対象
   * @param value 操作量
   * @param withoutOverClock オーバークロック時の効果を発動させない
   */
  static clock(
    stack: Stack,
    source: Card,
    target: Unit,
    value: number,
    withoutOverClock: boolean = false
  ): void {
    const before = target.lv;

    target.lv += value;
    if (target.lv > 3) target.lv = 3;
    if (target.lv < 1) target.lv = 1;

    // 結果としてLvが変動した場合にのみStackを積む
    if (target.lv !== before) {
      // Lv上昇の場合はダメージをリセットする
      if (value > 0) {
        target.delta = target.delta.filter(delta => delta.effect.type !== 'damage');
        stack.core.room.soundEffect('clock-up');
        stack.core.room.soundEffect('clock-up-field');
      } else {
        stack.core.room.soundEffect('damage');
      }

      // クロックレベル操作エフェクトを発行
      stack.core.room.broadcastToAll(
        createMessage({
          action: {
            type: 'effect',
            handler: 'client',
          },
          payload: {
            type: 'VisualEffect',
            body: {
              effect: 'status',
              type: 'level',
              value: target.lv,
              unitId: target.id,
            },
          },
        })
      );

      // Lvの差による基本BPの差をカタログから算出し、基本BPに加算
      const beforeBBP = target.catalog.bp?.[before - 1] ?? 0;
      const afterBBP = target.catalog.bp?.[target.lv - 1] ?? 0;
      const diff = afterBBP - beforeBBP;
      target.bp += diff;

      stack.addChildStack(`clock${target.lv > before ? 'up' : 'down'}`, source, target, {
        type: 'lv',
        value: target.lv - before,
      });

      if (target.currentBP <= 0) {
        Effect.break(stack, target, target, 'system');
      } else if (target.lv === 3 && !withoutOverClock) {
        stack.addChildStack('overclock', source, target);
      }
    }
  }

  /**
   * ユニットにキーワード能力を付与する
   * @param stack
   * @param source 効果の発動元
   * @param target 対象のユニット
   * @param keyword 対象のキーワード
   * @param option 対象のキーワードの持続時間など
   * @example
   * // 無期限に【秩序の盾】を得る
   * Effect.keyword(stack, source, target, '秩序の盾')
   * // 次のターン終了を迎えるまで【貫通】を得る
   * Effect.keyword(stack, source, target, '貫通', { event: 'turnEnd', count: 1 })
   */
  static keyword(
    stack: Stack,
    source: Card,
    target: Unit,
    keyword: KeywordEffect,
    option?: KeywordOptionParams
  ) {
    if (
      keyword === '沈黙' &&
      target.hasKeyword('沈黙効果耐性') &&
      source.owner.id !== target.owner.id
    ) {
      stack.core.room.soundEffect('block');
      stack.core.room.sync(true);
      return;
    }

    const delta =
      keyword === '次元干渉'
        ? new Delta({ type: 'keyword', name: keyword, cost: option?.cost ?? 0 }, { ...option })
        : new Delta({ type: 'keyword', name: keyword }, { ...option });
    target.delta.push(delta);

    switch (keyword) {
      case '秩序の盾':
      case '不滅':
      case '加護':
      case '王の治癒力':
      case '固着':
      case '破壊効果耐性':
      case '無我の境地':
      case '沈黙効果耐性':
      case '消滅効果耐性':
      case 'セレクトハック':
        stack.core.room.soundEffect('guard');
        break;
      case '貫通':
        stack.core.room.soundEffect('penetrate');
        break;
      case '呪縛':
        stack.core.room.soundEffect('bind');
        break;
      case '不屈':
        stack.core.room.soundEffect('fortitude');
        break;
      case '強制防御':
      case '撤退禁止':
      case '攻撃禁止':
      case '防御禁止':
      case '進化禁止':
        stack.core.room.soundEffect('damage');
        break;
      case '神託':
        stack.core.room.soundEffect('oracle');
        break;
      case '次元干渉':
        stack.core.room.soundEffect('unblockable');
        break;
      case '沈黙':
        stack.core.room.soundEffect('silent');
        stack.core.fieldEffectUnmount(target); // 沈黙付与先がフィールド効果を発動している場合 フィールド効果を unmount する
        break;
    }
  }

  /**
   * 特殊召喚を実行する
   * @param stack
   * @param source 効果の発動元
   * @param target 対象のユニット
   * @param isCopy <COPY>フラグ
   * @returns 特殊召喚に成功するとUnitを、失敗するとundefinedを返す
   */
  static async summon(
    stack: Stack,
    source: Card,
    target: Unit,
    isCopy?: boolean
  ): Promise<Unit | undefined> {
    // フィールドに空きがあるか
    const hasFieldSpace = target.owner.field.length < stack.core.room.rule.player.max.field;

    // 対象が進化でない
    const isNotEvolve = !(target instanceof Evolve);

    if (hasFieldSpace && isNotEvolve) {
      // ユニットが別の領域に存在する場合はそれを削除
      // (複製、デッキ外からの特殊召喚などは必ずしも別の領域に存在するとは限らないので例外はスローしない)
      const exist = target.owner.find(target);
      if (exist.result && exist.place && exist.place?.name !== 'field') {
        target.owner[exist.place.name] = target.owner[exist.place.name].filter(
          c => c.id !== target.id
        );
      }

      target.owner.field.push(target);

      if (!isCopy) {
        target.initBP();
        target.active = true;
      }
      stack.core.room.soundEffect(isCopy ? 'copied' : 'drive');

      stack.core.room.broadcastToAll(
        createMessage({
          action: {
            type: 'effect',
            handler: 'client',
          },
          payload: {
            type: 'VisualEffect',
            body: {
              effect: 'drive',
              image: `https://coj.sega.jp/player/img/${target.catalog.img}`,
              player: target.owner.id,
              type: 'UNIT',
            },
          },
        })
      );

      // 行動制限を付与
      Effect.keyword(stack, target, target, '行動制限');

      // 起動アイコン
      if (typeof target.catalog.onBootSelf === 'function')
        target.delta.unshift(new Delta({ type: 'keyword', name: '起動' }));

      stack.addChildStack('extraSummon', source, target);
      stack.core.room.sync();

      return new Promise(resolve => setTimeout(() => resolve(target), 1200));
    }
  }

  /**
   * 複製する
   * @param stack
   * @param source 効果の発動元
   * @param target 複製対象
   * @param owner 複製先のフィールド(プレイヤー)
   */
  static async clone(stack: Stack, source: Card, target: Unit, owner: Player): Promise<void> {
    const unit = target.clone(owner, true);
    stack.core.room.soundEffect('copying');
    sendSelectedVisualEffect(stack, target);
    await new Promise(resolve => setTimeout(resolve, 1000));

    await Effect.summon(stack, source, unit, true);
  }

  /**
   * 【スピードムーブ】を付与する
   * ゲーム的にはキーワード能力付与だが、実際の処理はキーワード除去なので別メソッド化
   * @param stack
   * @param target 対象
   */
  static speedMove(stack: Stack, target: Unit) {
    if (target.hasKeyword('行動制限')) {
      target.delta = target.delta.filter(
        delta => !(delta.effect.type === 'keyword' && delta.effect.name === '行動制限')
      );
      stack.core.room.soundEffect('speedmove');
    }
  }

  /**
   * 行動権を操作する
   * @param stack
   * @param source 効果の発動元
   * @param target 効果の対象
   * @param activate 操作値 指定された値に変化する
   */
  static activate(stack: Stack, source: Card, target: Unit, activate: boolean) {
    // 【無我の境地】: 対戦相手の効果によって行動権を消費しない
    if (!activate && target.hasKeyword('無我の境地') && target.owner.id !== source.owner.id) {
      stack.core.room.soundEffect('block');
      return;
    }

    target.active = activate;
  }

  static death(_stack: Stack, _source: Card, target: Unit, count: number) {
    const deathCounter = target.delta.find(delta => delta.effect.type === 'death');
    if (deathCounter && count < deathCounter.count) {
      deathCounter.count = count;
    } else {
      target.delta.push(
        new Delta({ type: 'death' }, { event: 'turnEnd', count, onlyForOwnersTurn: true })
      );
    }
  }

  static modifyLife(stack: Stack, player: Player, value: number) {
    player.life.current += value;
    if (value > 0) stack.core.room.soundEffect('recover');
    if (value < 0) stack.core.room.soundEffect('damage');
  }

  /**
   * ユニットからキーワード能力を除去する
   * @param stack
   * @param target 対象のユニット
   * @param keyword 除去するキーワード
   * @param option 除去条件（指定された場合、条件に一致するキーワードのみを除去）
   * @example
   * // 全ての【秩序の盾】を除去
   * Effect.removeKeyword(stack, target, '秩序の盾')
   * // 次のターン終了を迎えるまで付与された【貫通】のみを除去
   * Effect.removeKeyword(stack, target, '貫通', { event: 'turnEnd', count: 1 })
   */
  static removeKeyword(
    stack: Stack,
    target: Unit,
    keyword: KeywordEffect,
    option?: KeywordOptionParams
  ) {
    if (option) {
      // 条件が指定された場合、その条件に一致するキーワードのみを除去
      target.delta = target.delta.filter(
        delta =>
          !(
            delta.effect.type === 'keyword' &&
            delta.effect.name === keyword &&
            (!option.source || delta.source === option.source)
          )
      );
    } else {
      // 条件が指定されない場合、指定されたキーワードを全て除去
      target.delta = target.delta.filter(
        delta => !(delta.effect.type === 'keyword' && delta.effect.name === keyword)
      );
    }

    // キーワード除去時の効果音
    switch (keyword) {
      case '沈黙':
        stack.core.room.soundEffect('grow');
        break;
    }
  }
}
