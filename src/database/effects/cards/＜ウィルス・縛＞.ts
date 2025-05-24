import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onAttack: async (stack: StackWithCard): Promise<void> => {
    const isOpponentUnitAttacked = stack.source.id !== stack.processing.owner.id;
    const targets = stack.processing.owner.opponent.field.filter(
      unit => unit.id !== stack.processing.id
    );

    if (isOpponentUnitAttacked && targets.length > 0) {
      await System.show(stack, '＜ウィルス・縛＞', '【呪縛】を与える');
      EffectHelper.random(targets, 1).forEach(unit =>
        Effect.keyword(stack, stack.processing, unit, '呪縛')
      );
    }
  },
};
