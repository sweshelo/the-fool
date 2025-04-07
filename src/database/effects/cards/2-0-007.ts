import type { Stack } from '@/package/core/class/stack';

import type { Core } from '@/package/core/core';
import type { ICard } from '@/submodule/suit/types';
import { EffectTemplate } from '../templates';

export const effects = {
  onDriveSelf: async (stack: Stack, card: ICard, core: Core) => {
    await stack.displayEffect(core, '幸せの贈り物', 'お互いにカードを1枚引く');
    core.players.forEach(player => EffectTemplate.draw(player, core));
  },
};
