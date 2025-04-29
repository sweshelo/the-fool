import type { Stack } from '@/package/core/class/stack';
import { Effect, System } from '..';
import type { StackWithCard } from '../classes/types';
import { Card } from '@/package/core/class/card';

export const effects = {
  checkTrigger: (stack: StackWithCard): boolean => {
    if (!(stack.target instanceof Card)) return false;
    const owner = stack.processing.owner;
    const player = stack.target.owner;

    // インターセプト使用者とカード所有者が同じか
    const isSamePlayer = owner.id === player.id;
    // 対象のインターセプトが捨札に存在するか
    const isOnTrash = player.trash.some(c => c.id === stack.source.id);

    return isSamePlayer && isOnTrash;
  },

  onTrigger: async (stack: Stack) => {
    if (!(stack.target instanceof Card)) throw new Error('不正なオブジェクトが指定されました');

    await System.show(stack, 'トリガー・コネクト', '発動したインターセプトを回収');
    const owner = stack.target.owner;
    const target = owner.trash.find(c => c.id === stack.source.id);

    // 捨札から削除
    if (target && stack.processing) {
      Effect.move(stack, stack.processing, target, 'hand');
    }
  },
};
