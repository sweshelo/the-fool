import { Unit } from '@/package/core/class/card';
import { EffectHelper, EffectTemplate, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  checkDrive: (stack: StackWithCard) => {
    return stack.target instanceof Unit && stack.processing.owner.id === stack.target.owner.id;
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '天空の楽園', '【天使】を1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, { species: '天使' });
  },

  checkPlayerAttack: (stack: StackWithCard) => {
    return (
      stack.source instanceof Unit &&
      stack.source.catalog.species?.includes('天使') === true &&
      stack.processing.owner.id === stack.source.owner.id
    );
  },

  onPlayerAttack: async (stack: StackWithCard) => {
    await System.show(stack, '天空の楽園', '属性の異なる【天使】を2枚引く');
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
        species: '天使',
        color,
      })
        ? 1
        : 0;
      if (count >= 2) break;
    }
  },
};
