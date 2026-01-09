import { Unit } from '@/package/core/class/card';
import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    const opponent = stack.processing.owner.opponent;

    // 相手の手札が0枚の場合は効果を発動しない
    if (opponent.hand.length === 0) return;

    await System.show(stack, 'ロスト', '手札を1枚破壊');

    // 相手の手札からランダムで1枚選択
    const [targetCards] = EffectHelper.random(opponent.hand, 1);
    if (targetCards) {
      // 選んだカードを捨てる
      Effect.handes(stack, stack.processing, targetCards);
    }
  },
};
