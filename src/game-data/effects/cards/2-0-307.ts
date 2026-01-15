import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { StackWithCard } from '../schema/types';

export const effects = {
  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'エテ・トレモロ', '手札に戻す');
    Effect.bounce(stack, stack.processing, stack.processing, 'hand');
  },
};
