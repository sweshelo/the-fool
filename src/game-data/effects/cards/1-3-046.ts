import type { Stack } from '@/package/core/class/stack';
import { Effect, System } from '..';
import type { StackWithCard } from '../schema/types';
import { Card } from '@/package/core/class/card';

export const effects = {
  checkTrigger: (stack: StackWithCard): boolean => {
    if (!(stack.target instanceof Card)) return false;
    const owner = stack.processing.owner;
    const player = stack.target.owner;

    // トリガーカード使用者が自分か
    const isSamePlayer = owner.id === player.id;
    // 対象のトリガーカードが捨札に存在するか
    const isOnTrash = player.trash.some(c => c.id === stack.target?.id);

    return isSamePlayer && isOnTrash;
  },

  onTrigger: async (stack: Stack) => {
    if (!(stack.target instanceof Card)) throw new Error('不正なオブジェクトが指定されました');

    await System.show(stack, 'トリガー・コネクト', '発動したトリガーカードを回収');
    const owner = stack.target.owner;
    const target = owner.trash.find(c => c.id === stack.target?.id);

    // 捨札から回収
    if (target && stack.processing) {
      Effect.move(stack, stack.processing, target, 'hand');
    }
  },
};
