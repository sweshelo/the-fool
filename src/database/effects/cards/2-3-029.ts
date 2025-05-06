import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。
  checkPlayerAttack: (stack: StackWithCard) => {
    return stack.source instanceof Unit && stack.processing.owner.id === stack.source.owner.id;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onPlayerAttack: async (stack: StackWithCard): Promise<void> => {
    if (stack.source instanceof Unit) {
      await System.show(stack, 'ワンダーケーキ', `レベル+${stack.processing.lv >= 3 ? 2 : 1}`);
      Effect.clock(stack, stack.processing, stack.source, stack.processing.lv >= 3 ? 2 : 1);
    }
  },
};
