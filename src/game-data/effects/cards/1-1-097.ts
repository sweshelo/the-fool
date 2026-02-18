import { Effect } from '../engine/effect';
import { EffectHelper } from '../engine/helper';
import { System } from '../engine/system';
import type { CardEffects, StackWithCard } from '../schema/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.core.players.flatMap(player => player.hand).length > 0 &&
    stack.processing.owner.id === stack.source.id,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'ポイズンディナー', 'お互いの手札を2枚破壊');
    stack.core.players.forEach(player => {
      EffectHelper.random(player.hand, 2).forEach(card =>
        Effect.break(stack, stack.processing, card)
      );
    });
  },
};
