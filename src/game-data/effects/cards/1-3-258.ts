import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnStart: (stack: StackWithCard) => {
    return (
      stack.processing.owner.field.length > 0 &&
      stack.processing.owner.id !== stack.core.getTurnPlayer().id
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '冥護の領域', '【破壊効果耐性】を与える');
    stack.processing.owner.field.forEach(unit =>
      Effect.keyword(stack, stack.processing, unit, '破壊効果耐性', { event: 'turnEnd', count: 1 })
    );
  },
};
