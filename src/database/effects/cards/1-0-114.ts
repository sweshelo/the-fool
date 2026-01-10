import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../classes/types';
import { System } from '../classes/system';
import { Effect } from '../classes/effect';

export const effects: CardEffects = {
  onOverclockSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '天変地異', '全てのユニットを手札に戻す');
    stack.core.players
      .flatMap(player => player.field)
      .forEach(unit => Effect.bounce(stack, stack.processing, unit, 'hand'));
  },
};
