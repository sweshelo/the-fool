import type { Stack } from '@/package/core/class/stack';

import type { Core } from '@/package/core/core';
import type { ICard } from '@/submodule/suit/types';
import { EffectTemplate } from '../templates';
import { EffectHelper } from '../helper';

export const effects = {
  onDriveSelf: async (stack: Stack, card: ICard, core: Core) => {
    await stack.displayEffect(core, 'チャージ＆ドロー', 'カードを1枚引く');
    EffectTemplate.draw(EffectHelper.owner(core, card), core);
  },
};
