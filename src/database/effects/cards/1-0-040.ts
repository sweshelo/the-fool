import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Card } from '@/package/core/class/card';
import { System, EffectHelper, EffectTemplate } from '..';

export const effects = {
  onDriveSelf: async (stack: Stack, card: Card, core: Core) => {
    await System.show(stack, core, 'ドロー', 'カードを1枚引く', card);
    EffectTemplate.draw(EffectHelper.owner(core, card), core);
  },
};
