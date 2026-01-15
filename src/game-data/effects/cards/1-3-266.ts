import { Unit } from '@/package/core/class/card';
import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  // カードが発動可能であるかを調べ、発動条件を満たしていれば true を、そうでなければ false を返す。

  checkBattle: (_stack: StackWithCard) => {
    return true;
  },

  // 実際の効果本体
  // 関数名に self は付かない
  onBattle: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, '武器破壊', 'BP1/2');
    const unit = [stack.source, stack.target]
      .filter(card => card instanceof Unit)
      .find(unit => stack.processing.owner.opponent.find(unit).result);
    if (unit) {
      Effect.modifyBP(stack, stack.processing, unit, -(unit.currentBP / 2), {
        event: 'turnEnd',
        count: 1,
      });
    }
  },
};
