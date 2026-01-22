import { System } from '../../engine/system';
import { Effect } from '../../engine/effect';
import type { CardEffects, StackWithCard } from '../../schema/types';
import type { Card } from '@/package/core/class/card/Card';

export const effects: CardEffects = {
  checkJoker: (player, _core) => {
    const opponent = player.opponent;
    return opponent.hand.length > 0;
  },

  onJokerSelf: async (stack: StackWithCard) => {
    const owner = stack.processing.owner;
    const opponent = owner.opponent;

    if (opponent.hand.length === 0) return;

    await System.show(stack, '明天凶殺', '手札を全て破壊');

    // 対戦相手の手札を全て破壊する
    [...opponent.hand].forEach((card: Card) => {
      Effect.break(stack, stack.processing, card);
    });
  },
};
