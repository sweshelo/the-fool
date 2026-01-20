import { Effect, EffectHelper, System } from '..';
import type { StackWithCard } from '../schema/types';

export const effects = {
  onOverclockSelf: async (stack: StackWithCard) => {
    if (stack.processing.owner.opponent.trigger.length > 0) {
      await System.show(stack, 'ペローネ・ブラスト', 'トリガーゾーンを2枚破壊');
      EffectHelper.random(stack.processing.owner.opponent.trigger, 2).forEach(card =>
        Effect.move(stack, stack.processing, card, 'trash')
      );
    }
  },
};
