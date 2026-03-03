import { Effect } from '@/game-data/effects/engine/effect';
import { EffectHelper } from '@/game-data/effects/engine/helper';
import { System } from '@/game-data/effects/engine/system';
import type { CardEffects, StackWithCard } from '@/game-data/effects/schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) =>
    (stack.processing.owner.field.length <= 4 &&
      stack.target instanceof Unit &&
      stack.target.owner.id === stack.processing.owner.id &&
      stack.target.catalog.species?.includes('武身') &&
      stack.processing.owner.deck.some(
        card =>
          card instanceof Unit && card.catalog.cost <= 5 && card.catalog.species?.includes('武身')
      )) ||
    false,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, '結集セシ化身タチ', 'デッキから【武身】を【特殊召喚】');
    const [target] = EffectHelper.random(
      stack.processing.owner.deck.filter(
        card =>
          card instanceof Unit && card.catalog.species?.includes('武身') && card.catalog.cost <= 5
      )
    );
    if (target instanceof Unit) await Effect.summon(stack, stack.processing, target);
  },
};
