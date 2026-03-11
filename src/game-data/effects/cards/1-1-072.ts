import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  // このユニットのBPは+［あなたのライフ×1000］される。
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '正統なる血統', 'BP+[ライフ×1000]');
  },

  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) => {
        if (target instanceof Unit)
          Effect.dynamicBP(
            stack,
            stack.processing,
            target,
            target => target.owner.life.current * 1000,
            { source }
          );
      },
      effectCode: '正当なる血統',
      targets: ['self'],
    });
  },
};
