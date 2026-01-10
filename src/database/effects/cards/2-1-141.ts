import { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { EffectHelper } from '../classes/helper';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  checkDrive: stack => {
    const target = stack.target;
    return (
      target instanceof Unit &&
      target.owner.id === stack.processing.owner.id &&
      stack.processing.owner.field.length <= 4 &&
      stack.processing.owner.trash.some(
        card =>
          card.catalog.type === 'unit' &&
          card.catalog.cost <= target.catalog.cost &&
          card.catalog.species?.some(species => target.catalog.species?.includes(species))
      )
    );
  },

  onDrive: async (stack: StackWithCard) => {
    const driveUnit = stack.target;
    if (driveUnit instanceof Unit) {
      await System.show(stack, '二面性', '同じ種族のユニットを【特殊召喚】');
      const [target] = EffectHelper.random(
        stack.processing.owner.trash.filter(
          card =>
            card.catalog.type === 'unit' &&
            card.catalog.cost <= driveUnit.catalog.cost &&
            card.catalog.species?.some(species => driveUnit.catalog.species?.includes(species))
        )
      );
      if (target instanceof Unit) {
        await Effect.summon(stack, stack.processing, target);
      }
    }
  },
};
