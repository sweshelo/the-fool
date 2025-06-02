import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    if (
      stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('獣')).length >= 2
    ) {
      await System.show(stack, '生存戦略', '捨札から【獣】を回収');
      EffectHelper.random(
        stack.processing.owner.trash.filter(card => card.catalog.species?.includes('獣'))
      ).forEach(card => Effect.move(stack, stack.processing, card, 'hand'));
    }
  },
};
