import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    const candidate = stack.processing.owner.trash.filter(
      card =>
        card.catalog.species?.includes('悪魔') &&
        card.catalog.cost <= 5 &&
        card.catalog.type === 'unit'
    );
    if (
      stack.source instanceof Unit &&
      stack.processing.owner.id === stack.source.owner.id &&
      candidate.length > 0 &&
      stack.processing.owner.field.length <= 4
    ) {
      await System.show(stack, '魔軍召喚', '【悪魔】ユニットを【特殊召喚】');
      await Promise.all(
        EffectHelper.random(candidate, 1).map(unit =>
          Effect.summon(stack, stack.processing, unit as Unit)
        )
      );
    }
  },
};
