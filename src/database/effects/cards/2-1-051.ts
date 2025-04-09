import type { Stack } from '@/package/core/class/stack';

import type { Core } from '@/package/core/core';
import type { Card } from '@/package/core/class/card';
import { EffectTemplate , System, EffectHelper } from '..';

export const effects = {
  checkDrive: (stack: Stack, card: Card, core: Core) => {
    return EffectHelper.owner(core, stack.source).id === EffectHelper.owner(core, card).id;
  },
  onDrive: async (stack: Stack, card: Card, core: Core) => {
    const owner = EffectHelper.owner(core, card);
    if (owner.deck.length >= 2) {
      await System.show(stack, core, '最後の一葉', 'カードを1枚引く');
      EffectTemplate.draw(owner, core);
    } else {
      await System.show(stack, core, '最後の一葉', 'カードを2枚引く');
      [...Array(2)].forEach(() => EffectTemplate.draw(owner, core));
    }
  },
};
