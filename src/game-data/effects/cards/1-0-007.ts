import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  onOverclockSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'マグニボム', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },
};
