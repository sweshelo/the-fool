import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onAttack: async (stack: StackWithCard<Unit>): Promise<void> => {
    const isOpponentUnitAttacked = stack.source.id !== stack.processing.owner.id;

    if (isOpponentUnitAttacked && stack.source instanceof Unit) {
      await System.show(stack, '＜ウィルス・攻＞', '基本BP+1000');
      Effect.modifyBP(stack, stack.processing, stack.source, 1000, { isBaseBP: true });
    }
  },
};
