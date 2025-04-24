import { Effect, System } from '..';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  onOverclockSelf: async (stack: StackWithCard): Promise<void> => {
    await System.show(stack, 'ビッカーンッ！', '全てのユニットを手札に戻す');
    [...stack.core.players.map(player => player.field).flat()].forEach(unit =>
      Effect.bounce(stack, stack.processing, unit, 'hand')
    );
  },
};
