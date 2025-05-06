import { Color } from '@/submodule/suit/constant/color';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onDriveSelf: async (stack: StackWithCard): Promise<void> => {
    System.show(stack, '黎明を告げる紫翼', '紫属性ユニットに【スピードムーブ】を与える');
  },

  fieldEffect: (stack: StackWithCard) => {
    stack.processing.owner.field
      .filter(unit => unit.catalog.color === Color.PURPLE && unit.hasKeyword('行動制限'))
      .forEach(unit => Effect.speedMove(stack, unit));
  },
};
