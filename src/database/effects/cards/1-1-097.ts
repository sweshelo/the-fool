import { Effect } from '../classes/effect';
import { EffectHelper } from '../classes/helper';
import { System } from '../classes/system';
import type { CardEffects, StackWithCard } from '../classes/types';

export const effects: CardEffects = {
  checkDrive: stack =>
    stack.core.players.flatMap(player => player.hand).length > 0 &&
    stack.processing.owner.id === stack.source.id,
  onDrive: async (stack: StackWithCard) => {
    await System.show(stack, 'ポイズンディナー', 'お互いの手札を2枚破壊');
    stack.core.players.forEach(player => {
      EffectHelper.random(player.hand, 2).forEach(card =>
        Effect.handes(stack, stack.processing, card)
      );
    });
  },
};
