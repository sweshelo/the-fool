import type { Stack } from '@/package/core/class/stack';
import { EffectTemplate, System, EffectHelper } from '..';
import { Color } from '@/submodule/suit/constant/color';

export const effects = {
  onDriveSelf: async (stack: Stack) => {
    await System.show(stack, '援軍／紫', '紫属性ユニットを1枚引く');
    const owner = EffectHelper.owner(stack.core, stack.processing);
    EffectTemplate.reinforcements(stack, owner, { color: Color.PURPLE });
  },
};
