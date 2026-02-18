import { Effect } from '../engine/effect';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard) => {
    await System.show(stack, '死への誘い', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },
};
