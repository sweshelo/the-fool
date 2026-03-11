import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkDrive: (_stack: StackWithCard) => true,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '大いなる世界', 'CP-12');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, -12);
    Effect.modifyCP(stack, stack.processing, stack.processing.owner.opponent, -12);
  },
};
