import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { ICard } from '@/submodule/suit/types';

export const effects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkDrive: (stack: Stack, card: ICard, core: Core): boolean => {
    return true;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: Stack, card: ICard, core: Core) => {
    await stack.displayEffect(core, '効果名', '');
  },
};
