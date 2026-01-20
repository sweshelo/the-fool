import { Unit } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    const count =
      stack.processing.owner.field.filter(unit => unit.catalog.species?.includes('珍獣')).length >=
      4
        ? 2
        : 1;

    await System.show(stack, '学びの庭', `【珍獣】を${count}枚引く`);
    [...Array(count)].forEach(() =>
      EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '珍獣' })
    );
  },
};
