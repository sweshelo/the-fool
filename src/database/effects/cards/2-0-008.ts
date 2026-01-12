import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';
import type { Unit } from '@/package/core/class/card';

export const effects: CardEffects = {
  onOverclockSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ビッカーンッ！', '全てのユニットを手札に戻す');
    stack.core.players
      .flatMap(player => player.field)
      .forEach(unit => Effect.bounce(stack, stack.processing, unit, 'hand'));
  },

  onBlockSelf: async (stack: StackWithCard<Unit>): Promise<void> => {
    await System.show(stack, 'ゴールデン・ブロッカー', 'BP+4000');

    Effect.modifyBP(stack, stack.processing, stack.processing, 4000, {
      event: 'turnEnd',
      count: 1,
    });
  },
};
