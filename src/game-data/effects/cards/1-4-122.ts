import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return [...stack.processing.owner.field, ...stack.processing.owner.opponent.field].length >= 9;
  },
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '定員オーバー', '1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },
};
