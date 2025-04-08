import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { Card } from '@/package/core/class/card';
import { System } from '..';

export const effects = {
  // 自身が召喚された時に発動する効果を記述
  onDriveSelf: async (stack: Stack, card: Card, core: Core) => {
    await System.show(stack, core, '効果名', '');
  },

  // 自身以外が召喚された時に発動する効果を記述
  // 味方ユニットであるかの判定などを忘れない
  onDrive: async (stack: Stack, card: Card, core: Core) => {
    await System.show(stack, core, '効果名', '');
  },
};
