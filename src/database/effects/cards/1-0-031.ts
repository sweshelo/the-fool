import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Card } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';

export const effects = {
  onOverclockSelf: async (stack: Stack, card: Card, core: Core) => {
    await System.show(stack, core, 'リバイブ', '捨札から1枚選んで回収');
    await EffectTemplate.revive(stack, card, core, 1);
  },
};
