import type { Stack } from '@/package/core/class/stack';

import type { Core } from '@/package/core/core';
import type { ICard } from '@/submodule/suit/types';
import { EffectHelper } from '../helper';
import { EffectTemplate } from '../templates';

export const effects = {
  checkDrive: (stack: Stack, card: ICard, core: Core) => {
    return EffectHelper.owner(core, stack.source).id === EffectHelper.owner(core, card).id;
  },
  onDrive: async (stack: Stack, card: ICard, core: Core) => {
    const owner = EffectHelper.owner(core, card);
    if (owner.deck.length >= 2) {
      await stack.displayEffect(core, '最後の一葉', 'カードを1枚引く');
      EffectTemplate.draw(owner, core);
    } else {
      await stack.displayEffect(core, '最後の一葉', 'カードを2枚引く');
      [...Array(2)].forEach(() => EffectTemplate.draw(owner, core));
    }
  },
};
