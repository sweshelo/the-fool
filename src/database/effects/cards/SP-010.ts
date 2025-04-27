// FIXME: 効果が発動しないことがある

import { Effect, EffectHelper, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onBreakSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ロスト', '手札を1枚破壊');
    const opponent = EffectHelper.opponent(stack.core, stack.processing);
    const [target] = EffectHelper.random(opponent.hand, 1);
    if (target) Effect.handes(stack, stack.processing, target);
  },
};
