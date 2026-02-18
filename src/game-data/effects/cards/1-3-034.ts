import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '秩序の盾', '対戦相手の効果によるダメージを受けない');
    Effect.keyword(stack, stack.processing, stack.processing, '秩序の盾');
  },

  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    if (!(stack.processing instanceof Unit)) return;
    if (stack.source.id !== stack.processing.owner.id) return;

    await System.show(stack, '自然の恵み', 'レベル+1');
    Effect.clock(stack, stack.processing, stack.processing, 1);
  },
};
