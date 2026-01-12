import type { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '月面直帰', '自身を手札に戻す\n紫ゲージ+2');
    Effect.bounce(stack, stack.processing, stack.processing, 'hand');
    await Effect.modifyPurple(stack, stack.processing, stack.processing.owner, 2);
  },
};
