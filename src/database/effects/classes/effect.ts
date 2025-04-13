import type { Stack } from '@/package/core/class/stack';
import { EffectHelper } from './helper';
import type { Card, Unit } from '@/package/core/class/card';

export class Effect {
  static async damage(stack: Stack, source: Card, target: Unit, value: number) {
    // 対象がフィールド上に存在するか確認
    const exists = EffectHelper.owner(stack.core, target).find(target);
    const isOnField = exists.result && exists.place?.name === 'field';
    if (!isOnField) return;

    // TODO: 耐性持ちのチェックをここでやる

    target.bp.damage += value;
    stack.addChildStack('damage', source, target);
    stack.core.room.soundEffect('damage');

    // 破壊された?
    if (target.bp.base + target.bp.diff - target.bp.damage <= 0) {
      this.break(stack, source, target, 'damage');
    }
  }

  /**
   * 対象を破壊する
   * @param source 効果の発動元
   * @param target 破壊の対象
   */
  static async break(
    stack: Stack,
    source: Card,
    target: Unit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _cause: string = 'effect'
  ) {
    // 対象がフィールド上に存在するか確認
    const exists = EffectHelper.owner(stack.core, target).find(target);
    const isOnField =
      exists.result && exists.place?.name === 'field' && target.destination !== 'trash';

    if (!isOnField) return;

    // TODO: 耐性持ちのチェックをここでやる
    stack.addChildStack('break', source, target);
    target.destination = 'trash';
    stack.core.room.soundEffect('bang');
  }

  /**
   * 効果によって手札を捨てさせる
   * @param source 効果の発動元
   * @param target 破壊する手札
   */
  static async handes(stack: Stack, source: Card, target: Card) {
    const owner = EffectHelper.owner(stack.core, target);
    const card = owner.find(target);

    if (card.place?.name === 'hand') {
      owner.hand = owner.hand.filter(c => c.id !== target.id);
      owner.trash.push(target);
      stack.core.room.sync();
      stack.core.room.soundEffect('destruction');

      stack.addChildStack('handes', source, target);
    }
  }

  static async move(
    stack: Stack,
    source: Card,
    target: Card,
    location: 'hand' | 'trigger' | 'deck' | 'trash'
  ) {
    const owner = EffectHelper.owner(stack.core, target);
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
}
