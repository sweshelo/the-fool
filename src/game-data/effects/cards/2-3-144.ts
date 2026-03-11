import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkTurnEnd: (stack: StackWithCard) => stack.source.id === stack.processing.owner.id,
  onTurnEnd: async (stack: StackWithCard) => {
    await System.show(stack, 'すやすやスリーピング', '手札とフィールドのユニットのレベル-2');
    [
      ...stack.processing.owner.field,
      ...stack.processing.owner.hand,
      ...stack.processing.owner.opponent.field,
      ...stack.processing.owner.opponent.hand,
    ].forEach(card => {
      if (card instanceof Unit) Effect.clock(stack, stack.processing, card, -2);
    });
  },
};
