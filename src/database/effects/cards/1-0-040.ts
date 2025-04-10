import type { Stack } from '@/package/core/class/stack';
import { System, EffectHelper, EffectTemplate } from '..';

export const effects = {
  onDriveSelf: async (stack: Stack) => {
    await System.show(stack, 'ドロー', 'カードを1枚引く');
    EffectTemplate.draw(EffectHelper.owner(stack.core, stack.processing), stack.core);
  },
};
