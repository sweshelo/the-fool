import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { ICard } from '@/submodule/suit/types';
import { EffectTemplate } from '../../templates';

export const effects = {
  onOverclockSelf: async (stack: Stack, card: ICard, core: Core) => {
    await stack.displayEffect(core, 'この指とーまれい', '【珍獣】ユニットを2枚引く');
    [...Array(2)].forEach(() =>
      EffectTemplate.reinforcements(stack, card, core, { species: '珍獣' })
    );
  },
};
