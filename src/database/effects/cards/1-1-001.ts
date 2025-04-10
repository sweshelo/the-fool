import type { Stack } from '@/package/core/class/stack';
import { EffectHelper, EffectTemplate, System } from '..';
import { Color } from '@/submodule/suit/constant/color';

export const effects = {
  onDriveSelf: async (stack: Stack) => {
    await System.show(stack, '孤独との別れ', '赤属性ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, EffectHelper.owner(stack.core, stack.processing), {
      color: Color.RED,
    });
  },
};
