import type { Stack } from '@/package/core/class/stack';
import { EffectTemplate, System, EffectHelper } from '..';

export const effects = {
  onOverclockSelf: async (stack: Stack) => {
    await System.show(stack, 'この指とーまれい', '【珍獣】ユニットを2枚引く');
    const owner = EffectHelper.owner(stack.core, stack.processing);
    [...Array(2)].forEach(() => EffectTemplate.reinforcements(stack, owner, { species: '珍獣' }));
  },
};
