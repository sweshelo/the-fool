import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '月面直帰', '自身を手札に戻す\n紫ゲージ+2');
    Effect.bounce(stack, stack.processing, stack.processing as Unit, 'hand');
    Effect.modifyPurple(
      stack,
      stack.processing,
      EffectHelper.owner(stack.core, stack.processing),
      2
    );
  },
};
