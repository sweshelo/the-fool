import type { Stack } from '@/package/core/class/stack';
import type { Card, Unit } from '@/package/core/class/card';
import type { Player } from '@/package/core/class/Player';
import { Delta, type KeywordEffect } from '@/package/core/class/delta';

interface KeywordOptionParams {
  event?: string;
  count?: number;
}

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
    const hasKingsHealing = target.hasKeyword('王の治癒力') && target.currentBP() > damage;
    if (hasImmotal || hasOrderShield || hasKingsHealing) {
      stack.core.room.soundEffect('block');
      return false;
    }

    target.bp.damage += damage;
    stack.addChildStack('damage', source, target, {
      type: 'damage',
      cause: type,
      value: damage,
    });

    if (type !== 'battle') {
      stack.core.room.soundEffect('damage');
    }

    // 破壊された?
    if (target.currentBP() <= 0) {
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
  static modifyBP(stack: Stack, source: Card, target: Unit, value: number) {
    // 対象がフィールド上に存在するか確認
    const exists = target.owner.find(target);
    const isOnField = exists.result && exists.place?.name === 'field';
    if (!isOnField) throw new Error('対象が見つかりませんでした');

    // 既に破壊されているユニットのBPは変動させない
    if (target.destination !== undefined) return false;

    target.bp.diff += value;
    if (target.currentBP() <= 0) {
      Effect.break(stack, source, target, 'effect');
      return true;
    }

    return false;
  }

  /**
   * 対象を破壊する
   * @param source 効果の発動元
   * @param target 破壊の対象
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
  }

  /**
   * 対象を消滅させる
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

    console.log(exists);
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
  static move(
    stack: Stack,
    source: Card,
    target: Card,
    location: 'hand' | 'trigger' | 'deck' | 'trash'
  ): void {
    const owner = target.owner;
    const cardFind = owner.find(target);

    if (!cardFind.result || !cardFind.place) {
      throw new Error('対象が見つかりませんでした');
    }

    const origin = cardFind.place.name;

    // Type guard to check if the origin is a valid card location
    if (!['hand', 'trigger', 'deck', 'trash', 'field'].includes(origin)) {
      throw new Error('無効な移動元です');
    }

    // Type guard to check if the location property exists on owner
    if (!(location in owner) || location === cardFind.place.name) {
      throw new Error('無効な移動先です');
    }

    if (location === 'hand' && owner.hand.length >= stack.core.room.rule.player.max.hand) return;

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
    }

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
    }

    stack.addChildStack('move', source, target);
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
   * この関数は Promise を返すが、演出のための待機なので、呼び出し元で必ずしも await しなくても良い。
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

    // TODO: これを紫ゲージの増減操作に変える
    // const updatedPurple = Math.max(Math.min(target.cp.current + value, 0), 5))

    stack.addChildStack('modifyCP', source, target, {
      type: 'cp',
      value,
    });

    // 演出
    for (let i = 0; i < Math.abs(value); i++) {
      if (value > 0) {
        stack.core.room.soundEffect('purple-increase');
      } else {
        stack.core.room.soundEffect('purple-consume');
      }
      await new Promise(resolve => setTimeout(resolve, 0.25));
    }
  }

  static clock(stack: Stack, source: Card, target: Unit, value: number): void {
    const before = target.lv;

    target.lv += value;
    if (target.lv > 3) target.lv = 3;
    if (target.lv < 1) target.lv = 1;

    // 結果としてLvが変動した場合にのみStackを積む
    if (target.lv !== before) {
      // Lv上昇の場合はダメージをリセットする
      if (value > 0) {
        target.bp.damage = 0;
        stack.core.room.soundEffect('clock-up');
        stack.core.room.soundEffect('clock-up-field');
      }

      // Lvの差による基本BPの差をカタログから算出し、基本BPに加算
      const beforeBBP = target.catalog.bp?.[before - 1] ?? 0;
      const afterBBP = target.catalog.bp?.[target.lv - 1] ?? 0;
      const diff = afterBBP - beforeBBP;
      target.bp.base += diff;

      stack.addChildStack('clock', source, target, {
        type: 'lv',
        value: target.lv - before,
      });

      if (target.currentBP() <= 0) {
        Effect.break(stack, target, target, 'system');
      } else if (target.lv === 3) {
        stack.addChildStack('overclock', source, target);
      }
    }
  }

  /**
   * ユニットにキーワード能力を付与する
   * @param stack
   * @param source 効果の発動元
   * @param target 対象のユニット
   * @param delta { keyword: '<対象のキーワード>', event: '<キーワード能力の剥奪が行われるイベント>', count: '<キーワード能力の剥奪までのイベント発生回数>'}
   * @example
   * // 次のターン終了を迎えるまで【貫通】を得る
   * Effect.keyword(stack, source, target, { keyword: '貫通', event: 'turnEnd', count: 1 })
   * // 無期限に【秩序の盾】を得る
   * Effect.keyword(stack, source, target, { keyword: '秩序の盾' })
   */
  static keyword(
    stack: Stack,
    source: Card,
    target: Unit,
    keyword: KeywordEffect,
    option?: KeywordOptionParams
  ) {
    // @ts-expect-error 沈黙効果耐性は未実装
    if (target.hasKeyword('沈黙効果耐性') && source.owner.id !== target.owner.id) {
      stack.core.room.soundEffect('block');
    }

    const delta = new Delta({ type: 'keyword', name: keyword }, option?.event, option?.count);
    target.delta.push(delta);

    switch (keyword) {
      case '秩序の盾':
      case '不滅':
      case '加護':
      case '王の治癒力':
      case '固着':
      case '破壊効果耐性':
      case '無我の境地':
        stack.core.room.soundEffect('guard');
        break;
      case '呪縛':
        stack.core.room.soundEffect('bind');
        break;
      case '不屈':
        // stack.core.room.soundEffect('');
        break;
      case '沈黙':
        stack.core.room.soundEffect('silent');
        break;
    }
  }
}
