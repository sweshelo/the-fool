import { Unit } from '@/package/core/class/card';
import { EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '冥府の武家屋敷', '【侍】を1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '侍' });
  },

  checkBreak: (stack: StackWithCard) => {
    return (
      stack.target instanceof Unit &&
      stack.target.catalog.species?.includes('侍') === true &&
      stack.processing.owner.id === stack.target.owner.id
    );
  },

  onBreak: async (stack: StackWithCard) => {
    await System.show(stack, '冥府の武家屋敷', '属性の異なる【侍】を2枚引く');
    const colors = EffectHelper.shuffle([
      Color.RED,
      Color.YELLOW,
      Color.BLUE,
      Color.GREEN,
      Color.PURPLE,
    ]);
    let count = 0;
    for (const color of colors) {
      count += EffectTemplate.reinforcements(stack, stack.processing.owner, {
        species: '侍',
        color,
      })
        ? 1
        : 0;
      if (count >= 2) break;
    }
  },
};
