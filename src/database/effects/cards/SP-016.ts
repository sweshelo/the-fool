import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { ICard } from '@/submodule/suit/types';
import { EffectTemplate } from '../../templates';
import { Color } from '@/submodule/suit/constant/color';

export const effects = {
  onDriveSelf: async (stack: Stack, card: ICard, core: Core) => {
    await stack.displayEffect(core, '援軍／緑', '緑属性ユニットを1枚引く');
    EffectTemplate.reinforcements(stack, card, core, { color: Color.GREEN });
  },
};
