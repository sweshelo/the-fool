import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '../engine/permanent';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, '闘士／神', '【神】1体につきBP+4000');
  },

  // 闘士／神：フィールドの【神】1体につき+4000される
  fieldEffect: (stack: StackWithCard<Unit>): void => {
    PermanentEffect.mount(stack, stack.processing, {
      effect: (unit, source) => {
        if (unit instanceof Unit) {
          Effect.dynamicBP(
            stack,
            stack.processing,
            unit,
            target =>
              target.owner.field.filter(unit => unit.catalog.species?.includes('神')).length * 4000,
            { source }
          );
        }
      },
      targets: ['self'],
      effectCode: '闘士／神',
    });
  },
};
