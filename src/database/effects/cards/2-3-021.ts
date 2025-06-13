import type { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (
      stack.processing.owner.purple &&
      stack.processing.owner.purple > 0 &&
      stack.processing.owner.opponent.field.length > 0
    ) {
      await System.show(stack, 'ランダマイズメテオ', '1000ダメージ×紫ゲージの数');
      [...Array(stack.processing.owner.purple)].forEach(() =>
        EffectHelper.random(stack.processing.owner.opponent.field).forEach(unit =>
          Effect.damage(stack, stack.processing, unit, 1000, 'effect')
        )
      );
    }
  },
};
