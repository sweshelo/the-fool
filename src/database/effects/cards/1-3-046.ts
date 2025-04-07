import type { Stack } from '@/package/core/class/stack';
import type { Core } from '@/package/core/core';
import type { ICard } from '@/submodule/suit/types';
import { EffectHelper } from '../helper';

export const effects = {
  checkTrigger: (stack: Stack, card: ICard, core: Core): boolean => {
    const owner = EffectHelper.owner(core, card);
    const player = EffectHelper.owner(core, stack.source);

    // インターセプト使用者とカード所有者が同じか
    const isSamePlayer = owner.id === player.id;
    // 対象のインターセプトが捨札に存在するか
    const isOnTrash = player.trash.some(c => c.id === stack.source.id);

    return isSamePlayer && isOnTrash;
  },

  onTrigger: async (stack: Stack, card: ICard, core: Core) => {
    await stack.displayEffect(core, 'トリガー・コネクト', '発動したインターセプトを回収');
    const owner = EffectHelper.owner(core, stack.source);
    const target = owner.trash.find(c => c.id === stack.source.id);

    // 捨札から削除
    if (target && owner.hand.length < core.room.rule.player.max.hand) {
      owner.trash = owner.trash.filter(c => c.id !== target?.id);
      owner.hand.push(target);
    }
  },
};
