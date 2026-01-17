import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, 'ブースト注射', '【天使】に【スピードムーブ】を与える');
  },

  fieldEffect: (stack: StackWithCard<Unit>) => {
    stack.processing.owner.field
      .filter(unit => unit.hasKeyword('行動制限') && unit.catalog.species?.includes('天使'))
      .forEach(unit => Effect.speedMove(stack, unit));
  },
};
