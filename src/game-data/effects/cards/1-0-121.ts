import { Effect } from '@/game-data/effects/engine/effect';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkBreak: (stack: StackWithCard) => {
    return stack.option?.type === 'break' && stack.option.cause === 'battle';
  },
  onBreak: async (stack: StackWithCard) => {
    await System.show(stack, '燃え広がる戦火', 'お互いに1ライフダメージ');
    Effect.modifyLife(stack, stack.processing, stack.processing.owner, -1);
    Effect.modifyLife(stack, stack.processing, stack.processing.owner.opponent, -1);
  },
};
