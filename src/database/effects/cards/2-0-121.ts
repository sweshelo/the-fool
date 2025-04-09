import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Card } from '@/package/core/class/card';
import { EffectTemplate, System } from '..';

export const effects = {
  onOverclockSelf: async (stack: Stack, card: Card, core: Core) => {
    await System.show(stack, core, 'この指とーまれい', '【珍獣】ユニットを2枚引く', card);
    [...Array(2)].forEach(() =>
      EffectTemplate.reinforcements(stack, card, core, { species: '珍獣' })
    );
  },
};
