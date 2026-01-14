import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkTurnStart: (stack: StackWithCard) => {
    return (
      stack.processing.owner.id !== stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.some(unit => unit.catalog.species?.includes('天使'))
    );
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(
      stack,
      'エンジェルシンフォニー',
      `【天使】のBP+${stack.processing.lv > 1 ? '10000' : '5000'}\n【破壊効果耐性】を与える`
    );
    stack.processing.owner.field.forEach(unit => {
      if (unit.catalog.species?.includes('天使')) {
        Effect.modifyBP(stack, stack.processing, unit, stack.processing.lv > 1 ? 10000 : 5000, {
          event: 'turnEnd',
          count: 1,
        });
        Effect.keyword(stack, stack.processing, unit, '破壊効果耐性', {
          event: 'turnEnd',
          count: 1,
        });
      }
    });
  },
};
