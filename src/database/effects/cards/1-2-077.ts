import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // ■勝者の証
  // あなたのユニットが戦闘に勝利した時
  checkWin: (stack: StackWithCard): boolean => {
    return stack.target instanceof Unit && stack.target.id === stack.processing.owner.id;
  },

  onWin: async (stack: StackWithCard): Promise<void> => {
    const myUnits = stack.processing.owner.field;

    if (myUnits.length > 0) {
      await System.show(stack, '勝者の証', '味方全体をオーバークロック');
      myUnits.forEach(unit => {
        Effect.clock(stack, stack.processing, unit, 2);
      });
    }
  },
};
