import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '貫通', 'ブロックを貫通してライフダメージを与える');
    Effect.keyword(stack, stack.processing, stack.processing, '貫通');
  },
};
