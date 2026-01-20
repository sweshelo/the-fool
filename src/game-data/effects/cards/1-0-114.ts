import type { Unit } from '@/package/core/class/card';
import type { CardEffects, StackWithCard } from '../schema/types';
import { System } from '../engine/system';
import { Effect } from '../engine/effect';

export const effects: CardEffects = {
  onOverclockSelf: async (stack: StackWithCard<Unit>) => {
    await System.show(stack, '天変地異', '全てのユニットを手札に戻す');
    stack.core.players
      .flatMap(player => player.field)
      .forEach(unit => Effect.bounce(stack, stack.processing, unit, 'hand'));
  },
};
