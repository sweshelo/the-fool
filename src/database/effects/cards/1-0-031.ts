import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { ICard } from '@/submodule/suit/types';
import { EffectTemplate } from '../../templates';

export const effects = {
  onOverclockSelf: async (stack: Stack, card: ICard, core: Core) => {
    await stack.displayEffect(core, 'リバイブ', '捨札から1枚選んで回収');
    await EffectTemplate.revive(stack, card, core, 1);
  },
};
