import { Evolve } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return (
      stack.target instanceof Evolve &&
      stack.processing.owner.id === stack.target.owner.id &&
      stack.target.catalog.cost >= 2
    );
  },

  checkTurnStart: (stack: StackWithCard) => {
    return (
      stack.processing.owner.id === stack.core.getTurnPlayer().id &&
      stack.processing.owner.field.length === 0
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onTurnStart: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '花の高原', 'CP+3');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 3);
  },

  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '花の高原', 'CP+3');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 3);
  },
};
