import { Unit } from '@/package/core/class/card';
import { Effect, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { PermanentEffect } from '@/game-data/effects/engine/permanent';

export const effects: CardEffects = {
  onBreak: async (stack: StackWithCard<Unit>): Promise<void> => {
    if (
      stack.target instanceof Unit &&
      stack.target.id !== stack.processing.id &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.species?.includes('侍')
    ) {
      await System.show(stack, '仁義の仇討', '【侍】を1枚引く');
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '侍' });
    }
  },

  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '闘士/侍', 'BP+[【侍】×1000]');
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    PermanentEffect.mount(stack.processing, {
      effect: (target, source) =>
        Effect.dynamicBP(
          stack,
          stack.processing,
          stack.processing,
          self =>
            self.owner.field.filter(unit => unit.catalog.species?.includes('侍')).length * 1000,
          { source }
        ),
      targets: ['self'],
      effectCode: '闘士',
    });
  },
};
