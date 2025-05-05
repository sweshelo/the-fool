import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (stack.processing.owner.opponent.field.length > 0) {
      await System.show(stack, '物言わぬ式具', '【沈黙】を与える');
      const max = Math.max(...stack.processing.owner.opponent.field.map(unit => unit.currentBP()));
      const candidate = stack.processing.owner.opponent.field.filter(
        unit => unit.currentBP() === max
      );

      EffectHelper.random(candidate).forEach(unit =>
        Effect.keyword(stack, stack.processing, unit, '沈黙')
      );
    }
  },
};
