import type { Stack } from '@/package/core/class/stack';
import { EffectTemplate, System, EffectHelper } from '..';

export const effects = {
  onDriveSelf: async (stack: Stack) => {
    await System.show(stack, 'チャージ＆ドロー', 'CP+1\nカードを1枚引く');
    const owner = EffectHelper.owner(stack.core, stack.processing);
    EffectTemplate.draw(owner, stack.core);
  },
};
