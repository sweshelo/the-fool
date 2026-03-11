import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) =>
    stack.processing.owner.id === stack.source.id &&
    stack.processing.owner.opponent.hand.length > 0,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '迷子', '手札を1枚破壊');
    EffectHelper.random(stack.processing.owner.opponent.hand).forEach(card => {
      Effect.break(stack, stack.processing, card);
    });
  },
};
