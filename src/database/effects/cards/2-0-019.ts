import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Card } from '@/package/core/class/card';
import { EffectTemplate, System, EffectHelper } from '..';

export const effects = {
  onDriveSelf: async (stack: Stack, card: Card, core: Core) => {
    await System.show(stack, core, 'チャージ＆ドロー', 'CP+1\nカードを1枚引く');
    EffectTemplate.draw(EffectHelper.owner(core, card), core);
  },
};
