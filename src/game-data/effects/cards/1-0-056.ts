import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkBreak: (stack: StackWithCard) =>
    stack.target instanceof Unit && stack.target.owner.id === stack.processing.owner.id,
  onBreak: async (stack: StackWithCard) => {
    await System.show(stack, '不穏な霧', 'CP+2');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 2);
  },
};
