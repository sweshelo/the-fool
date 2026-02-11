import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '破壊効果耐性', '対戦相手の効果によって破壊されない');
    Effect.keyword(stack, stack.processing, stack.processing, '破壊効果耐性');
  },
};
