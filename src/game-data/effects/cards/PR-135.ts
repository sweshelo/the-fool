import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack.processing, {
      targets: ['owns'],
      condition: unit => unit.catalog.species?.includes('機械'),
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.dynamicBP(
            stack,
            stack.processing,
            unit,
            self => self.owner.field.filter(u => u.catalog.species?.includes('機械')).length * 1000,
            { source }
          );
        }
      },
      effectCode: 'サポーター／機械',
    });
  },

  onDriveSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, 'サポーター／機械', 'BP+[【機械】×1000]');
  },
};
