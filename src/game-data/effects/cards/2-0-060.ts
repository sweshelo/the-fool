import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';
import { Color } from '@/submodule/suit/constant/color';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkDrive: (stack: StackWithCard) => {
    return (
      stack.target instanceof Unit &&
      stack.processing.owner.id === stack.target.owner.id &&
      stack.processing.owner.trash.filter(card => card.catalog.color === Color.GREEN).length >= 10
    );
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onDrive: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '救いの神風', 'CP+5');
    Effect.modifyCP(stack, stack.processing, stack.processing.owner, 5);
  },
};
