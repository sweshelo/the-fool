import { Delta } from '@/package/core/class/delta';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnEnd: (stack: StackWithCard): boolean => {
    return (
      stack.source.id === stack.processing.owner.id &&
      !!stack.processing.owner.field.find(unit => unit.catalog.name === '織女星ベガ') &&
      !!stack.processing.owner.field.find(unit => unit.catalog.name === '牽牛星アルタイル') &&
      !!stack.processing.owner.field.find(unit => unit.catalog.name === '天川星デネブ')
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnEnd: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(
        stack,
        'トライフォース',
        'デネブ／アルタイル／ベガに【加護】を付与\nユニットを消滅'
      );
      const [target] = EffectHelper.random(stack.processing.owner.opponent.field);
      if (target) Effect.delete(stack, stack.processing, target);
    } else {
      await System.show(stack, 'トライフォース', 'デネブ／アルタイル／ベガに【加護】を付与');
    }
    stack.processing.owner.field
      .filter(
        unit =>
          unit.catalog.name === '織女星ベガ' ||
          unit.catalog.name === '牽牛星アルタイル' ||
          unit.catalog.name === '天川星デネブ'
      )
      .forEach(unit => Effect.keyword(stack, stack.processing, unit, '加護'));
  },

  checkDrive: (stack: StackWithCard) => {
    return (
      stack.source.id === stack.processing.owner.id &&
      stack.processing.owner.hand.filter(
        unit =>
          unit.catalog.name === '織女星ベガ' ||
          unit.catalog.name === '牽牛星アルタイル' ||
          unit.catalog.name === '天川星デネブ'
      ).length > 0
    );
  },

  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'トライフォース', 'デネブ／アルタイル／ベガのコスト-1');
    stack.processing.owner.hand
      .filter(
        unit =>
          unit.catalog.name === '織女星ベガ' ||
          unit.catalog.name === '牽牛星アルタイル' ||
          unit.catalog.name === '天川星デネブ'
      )
      .forEach(card => card.delta.push(new Delta({ type: 'cost', value: -1 })));
  },
};
