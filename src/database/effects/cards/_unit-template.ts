import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { ICard } from '@/submodule/suit/types';

export const effects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: Stack, card: ICard, core: Core) => {
    await stack.displayEffect(core, '効果名', '');
  },

  // 自身以外が召喚された時に発動する効果を記述
  // 味方ユニットであるかの判定などを忘れない
  onDrive: async (stack: Stack, card: ICard, core: Core) => {
    await stack.displayEffect(core, '効果名', '');
  },
};
