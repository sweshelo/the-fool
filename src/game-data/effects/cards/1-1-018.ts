import { EffectTemplate, System } from '..';
import { Color } from '@/submodule/suit/constant/color';
import type { StackWithCard } from '../schema/types';

export const effects = {
  onDriveSelf: async (stack: StackWithCard) => {
    await System.show(stack, '援軍／緑', '緑属性ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, stack.processing.owner, {
      color: Color.GREEN,
      type: ['unit', 'advanced_unit'],
    });
  },
};
