import type { Stack } from '@/package/core/class/stack';
import { EffectTemplate, System } from '..';

export const effects = {
  onDriveSelf: async (stack: Stack) => {
    await System.show(stack, '幸せの贈り物', 'お互いにカードを1枚引く');
    stack.core.players.forEach(player => EffectTemplate.draw(player, stack.core));
  },
};
