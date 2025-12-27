import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return (
      stack.target instanceof Unit &&
      !!stack.target.catalog.species?.includes('魔導士') &&
      stack.processing.owner.opponent.field.length > 0
    );
  },

  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '魔導の書', '敵全体に[【魔導士】×1000]ダメージ');
    stack.processing.owner.opponent.field.forEach(unit =>
      Effect.damage(
        stack,
        stack.processing,
        unit,
        stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('魔導士'))
          .length * 1000
      )
    );
  },
};
