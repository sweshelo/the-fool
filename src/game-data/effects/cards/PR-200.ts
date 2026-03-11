import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    if (stack.processing.owner.opponent.hand.length === 0) return;

    await System.show(stack, 'スウィート・リトル・ブレス', '手札のレベル-2');
    stack.processing.owner.opponent.hand.forEach(card => {
      Effect.clock(stack, stack.processing, card, -2);
    });
  },
};
