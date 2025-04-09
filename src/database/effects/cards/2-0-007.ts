import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Card } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';

export const effects = {
  onDriveSelf: async (stack: Stack, card: Card, core: Core) => {
    await System.show(stack, core, '幸せの贈り物', 'お互いにカードを1枚引く', card);
    core.players.forEach(player => EffectTemplate.draw(player, core));
  },
};
