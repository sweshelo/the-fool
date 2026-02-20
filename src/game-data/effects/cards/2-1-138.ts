import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  // あなたのユニットがブロックした時、あなたのフィールドにユニットが4体以下の場合
  checkBlock: (stack: StackWithCard): boolean => {
    const owner = stack.processing.owner;

    return (
      stack.target instanceof Unit && stack.target.owner.id === owner.id && owner.field.length <= 4
    );
  },

  // それをあなたのフィールドに【複製】し、【加護】を与える
  onBlock: async (stack: StackWithCard<Unit>) => {
    const owner = stack.processing.owner;
    if (!(stack.target instanceof Unit)) return;

    await System.show(stack, '聖なる法具', '【複製】して【加護】を付与');

    // 複製する
    const clone = await Effect.clone(stack, stack.processing, stack.target, owner);
    // 複製したユニットに加護を付与
    if (clone) {
      Effect.keyword(stack, stack.processing, clone, '加護');
    }
  },
};
