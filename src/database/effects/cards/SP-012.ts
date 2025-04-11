import type { Stack } from '@/package/core/class/stack';
import { EffectTemplate, System } from '..';

export const effects = {
  onOverclockSelf: async (stack: Stack) => {
    await System.show(stack, 'リバイブ', '捨札から1枚選んで回収');
    await EffectTemplate.revive(stack, 1);
  },
};
