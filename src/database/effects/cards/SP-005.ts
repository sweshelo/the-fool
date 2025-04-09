import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Card } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';
import { Color } from '@/submodule/suit/constant/color';

export const effects = {
  onDriveSelf: async (stack: Stack, card: Card, core: Core) => {
    await System.show(stack, core, '援軍／黄', '黄属性ユニットを1枚引く', card);
    EffectTemplate.reinforcements(stack, card, core, { color: Color.YELLOW });
  },
};
