import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnStart: (stack: StackWithCard): boolean => {
    return (
      stack.source.id === stack.processing.owner.id &&
      stack.processing.owner.field.length === 3 &&
      !!stack.processing.owner.field.find(unit => unit.catalog.name === '織女星ベガ') &&
      !!stack.processing.owner.field.find(unit => unit.catalog.name === '牽牛星アルタイル') &&
      !!stack.processing.owner.field.find(unit => unit.catalog.name === '天川星デネブ')
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'トリニティ・アステリズム', '3ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -3);
  },
};
